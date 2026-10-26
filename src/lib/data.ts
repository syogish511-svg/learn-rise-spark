import { supabase } from "@/integrations/supabase/client";
import { classifyEngagement, computeStats } from "./engagement";
import { percentage } from "./portal-validation";

export async function fetchStudents() {
  const { data: roles, error } = await supabase.from("user_roles").select("user_id").eq("role", "student");
  if (error) throw error;
  const ids = (roles ?? []).map((r) => r.user_id);
  if (!ids.length) return [];
  const { data, error: e2 } = await supabase.from("profiles").select("*").in("id", ids).order("full_name");
  if (e2) throw e2;
  return data ?? [];
}

export async function fetchSubjects() {
  const { data, error } = await supabase.from("subjects").select("id,name,chapters(id,name,sort_order)").order("name");
  if (error) throw error;
  return (data ?? []).map((s) => ({ ...s, chapters: [...(s.chapters ?? [])].sort((a, b) => a.sort_order - b.sort_order) }));
}

/** Everything needed to compute class-wide progress, read through RLS. */
export async function fetchClassBundle() {
  const [students, a, s, t, m] = await Promise.all([
    fetchStudents(),
    supabase.from("assignments").select("*").eq("published", true).order("due_at"),
    supabase.from("submissions").select("*"),
    supabase.from("tests").select("*").order("test_date"),
    supabase.from("test_marks").select("*"),
  ]);
  for (const r of [a, s, t, m]) if (r.error) throw r.error;
  return { students, assignments: a.data ?? [], submissions: s.data ?? [], tests: t.data ?? [], marks: m.data ?? [] };
}

export type ClassBundle = Awaited<ReturnType<typeof fetchClassBundle>>;

export function studentSummary(b: Pick<ClassBundle, "assignments" | "submissions" | "tests" | "marks">, studentId: string) {
  const subs = b.submissions.filter((x) => x.student_id === studentId);
  const testById = new Map(b.tests.map((t) => [t.id, t]));
  const marks = b.marks
    .filter((x) => x.student_id === studentId)
    .flatMap((m) => { const test = testById.get(m.test_id); return test ? [{ ...m, test }] : []; })
    .sort((x, y) => x.test.test_date.localeCompare(y.test.test_date));
  const pcts = marks.flatMap((m) => { const value = percentage(Number(m.marks), Number(m.test.max_marks)); return value === null ? [] : [value]; });
  const stats = computeStats(
    b.assignments.map((x) => ({ ...x, max_marks: Number(x.max_marks) })),
    subs.map((x) => ({ ...x, marks: x.marks === null ? null : Number(x.marks) })),
    pcts,
  );
  return { stats, engagement: classifyEngagement(stats), subs, marks };
}

export async function fetchStudentBundle(studentId: string) {
  const [p, a, s, t, m, act] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", studentId).maybeSingle(),
    supabase.from("assignments").select("*").eq("published", true).order("due_at"),
    supabase.from("submissions").select("*").eq("student_id", studentId),
    supabase.from("tests").select("*").order("test_date"),
    supabase.from("test_marks").select("*").eq("student_id", studentId),
    supabase.from("activity_log").select("*").eq("user_id", studentId).order("created_at", { ascending: false }).limit(20),
  ]);
  for (const r of [p, a, s, t, m, act]) if (r.error) throw r.error;
  return {
    profile: p.data,
    assignments: a.data ?? [],
    submissions: s.data ?? [],
    tests: t.data ?? [],
    marks: m.data ?? [],
    activity: act.data ?? [],
  };
}

export function downloadCsv(filename: string, rows: (string | number | null | undefined)[][]) {
  const csv = rows
    .map((r) => r.map((c) => `"${String(c ?? "").replace(/"/g, '""')}"`).join(","))
    .join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export async function openFile(bucket: "submissions" | "resources", path: string) {
  const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, 300);
  if (error) throw error;
  window.open(data.signedUrl, "_blank", "noopener");
}
