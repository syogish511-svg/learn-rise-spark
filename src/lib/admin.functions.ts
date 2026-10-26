import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { studentEmail } from "./school";

type Ctx = { supabase: any; userId: string };

async function assertStaff(ctx: Ctx, adminOnly = false) {
  const { data, error } = await ctx.supabase.rpc(adminOnly ? "has_role" : "is_staff", adminOnly ? { _user_id: ctx.userId, _role: "admin" } : { _user_id: ctx.userId });
  if (error || !data) throw new Error(adminOnly ? "Only administrators can do this." : "Only teachers can do this.");
}

async function writeAudit(ctx: Ctx, action: string, details: Record<string, unknown>) {
  await ctx.supabase.from("audit_log").insert({ actor_id: ctx.userId, action, details });
}

const studentInput = z.object({
  studentCode: z.string().trim().min(2).max(30).regex(/^[A-Za-z0-9._-]+$/, "Use letters, numbers, dot, dash or underscore"),
  fullName: z.string().trim().min(2).max(100),
  password: z.string().min(8).max(72),
  phone: z.string().trim().max(20).optional().default(""),
  parentName: z.string().trim().max(100).optional().default(""),
  parentPhone: z.string().trim().max(20).optional().default(""),
});

export const createStudent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => studentInput.parse(d))
  .handler(async ({ data, context }) => {
    await assertStaff(context as Ctx);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const code = data.studentCode.toUpperCase();
    const { data: created, error } = await supabaseAdmin.auth.admin.createUser({
      email: studentEmail(code),
      password: data.password,
      email_confirm: true,
      user_metadata: { full_name: data.fullName, student_code: code },
    });
    if (error) throw new Error(error.message.includes("already") ? "That Student ID is already in use." : error.message);
    const id = created.user.id;
    const roleResult = await supabaseAdmin.from("user_roles").insert({ user_id: id, role: "student" });
    if (roleResult.error) throw new Error(roleResult.error.message);
    await supabaseAdmin
      .from("profiles")
      .update({ phone: data.phone || null, parent_name: data.parentName || null, parent_phone: data.parentPhone || null })
      .eq("id", id);
    await writeAudit(context as Ctx, "student.create", { student_id: id, student_code: code });
    return { id };
  });

export const createStaffOrParent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        email: z.string().trim().email().max(255),
        fullName: z.string().trim().min(2).max(100),
        password: z.string().min(8).max(72),
        role: z.enum(["teacher", "parent"]),
        studentId: z.string().uuid().optional(),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    await assertStaff(context as Ctx, data.role === "teacher");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: created, error } = await supabaseAdmin.auth.admin.createUser({
      email: data.email,
      password: data.password,
      email_confirm: true,
      user_metadata: { full_name: data.fullName },
    });
    if (error) throw new Error(error.message);
    const id = created.user.id;
    const roleResult = await supabaseAdmin.from("user_roles").insert({ user_id: id, role: data.role });
    if (roleResult.error) throw new Error(roleResult.error.message);
    if (data.role === "parent" && data.studentId) {
      const linked = await supabaseAdmin.from("parent_links").insert({ parent_id: id, student_id: data.studentId });
      if (linked.error) throw new Error(linked.error.message);
    }
    await writeAudit(context as Ctx, `${data.role}.create`, { user_id: id, email: data.email, student_id: data.studentId });
    return { id };
  });

export const resetUserPassword = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ userId: z.string().uuid(), password: z.string().min(8).max(72) }).parse(d))
  .handler(async ({ data, context }) => {
    await assertStaff(context as Ctx);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: isStaffTarget } = await supabaseAdmin.rpc("is_staff", { _user_id: data.userId });
    if (isStaffTarget) await assertStaff(context as Ctx, true);
    const { error } = await supabaseAdmin.auth.admin.updateUserById(data.userId, { password: data.password });
    if (error) throw new Error(error.message);
    await writeAudit(context as Ctx, "user.reset_password", { user_id: data.userId });
    return { ok: true };
  });

export const setStudentActive = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ userId: z.string().uuid(), active: z.boolean() }).parse(d))
  .handler(async ({ data, context }) => {
    await assertStaff(context as Ctx, true);
    const { data: roles, error: roleError } = await context.supabase.from("user_roles").select("role").eq("user_id", data.userId);
    if (roleError || !roles?.some(r => r.role === "student") || roles.some(r => r.role !== "student")) throw new Error("Only student-only accounts can be activated or deactivated here.");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.auth.admin.updateUserById(data.userId, {
      ban_duration: data.active ? "none" : "876000h",
    });
    if (error) throw new Error(error.message);
    const updated = await supabaseAdmin.from("profiles").update({ is_active: data.active }).eq("id", data.userId).select("id").single();
    if (updated.error) throw new Error(updated.error.message);
    await writeAudit(context as Ctx, data.active ? "student.activate" : "student.deactivate", { user_id: data.userId });
    return { ok: true };
  });

export const assignAccountRole = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ userId: z.string().uuid(), role: z.enum(["teacher", "student", "parent"]), enabled: z.boolean() }).parse(d))
  .handler(async ({ data, context }) => {
    await assertStaff(context as Ctx, true);
    const { data: targetRoles, error: roleError } = await context.supabase.from("user_roles").select("role").eq("user_id", data.userId);
    if (roleError || targetRoles?.some(r => r.role === "admin")) throw new Error("Administrator roles are managed through secure school administration only.");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const profile = await supabaseAdmin.from("profiles").select("id").eq("id", data.userId).single();
    if (profile.error) throw new Error("Account not found.");
    if (data.enabled && !targetRoles?.some(r => r.role === data.role)) {
      const r = await supabaseAdmin.from("user_roles").insert({ user_id: data.userId, role: data.role });
      if (r.error) throw new Error(r.error.message);
    } else if (!data.enabled) {
      const r = await supabaseAdmin.from("user_roles").delete().eq("user_id", data.userId).eq("role", data.role);
      if (r.error) throw new Error(r.error.message);
    }
    await writeAudit(context as Ctx, "account.role", { user_id: data.userId, role: data.role, enabled: data.enabled });
    return { ok: true };
  });
