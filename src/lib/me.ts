import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type Me = {
  id: string;
  email: string | undefined;
  fullName: string;
  studentCode: string | null;
  isActive: boolean;
  roles: string[];
  isAdmin: boolean;
  isStaff: boolean;
  isStudent: boolean;
  isParent: boolean;
};

export async function fetchMe(): Promise<Me | null> {
  const { data: u } = await supabase.auth.getUser();
  if (!u.user) return null;
  const [{ data: profile }, { data: roles }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", u.user.id).maybeSingle(),
    supabase.from("user_roles").select("role").eq("user_id", u.user.id),
  ]);
  const r = (roles ?? []).map((x) => x.role as string);
  return {
    id: u.user.id,
    email: u.user.email,
    fullName: profile?.full_name || u.user.email || "User",
    studentCode: profile?.student_code ?? null,
    isActive: profile?.is_active ?? true,
    roles: r,
    isAdmin: r.includes("admin"),
    isStaff: r.includes("admin") || r.includes("teacher"),
    isStudent: r.includes("student"),
    isParent: r.includes("parent"),
  };
}

export function useMe() {
  return useQuery({ queryKey: ["me"], queryFn: fetchMe, staleTime: 60_000 });
}

export async function logActivity(action: string, entity?: string, entityId?: string, details: Record<string, unknown> = {}) {
  const { data } = await supabase.auth.getUser();
  if (!data.user) return;
  await supabase.from("activity_log").insert({ user_id: data.user.id, action, entity, entity_id: entityId, details: details as never });
}

export async function audit(action: string, details: Record<string, unknown> = {}) {
  const { data } = await supabase.auth.getUser();
  if (!data.user) return;
  await supabase.from("audit_log").insert({ actor_id: data.user.id, action, details: details as never });
}
