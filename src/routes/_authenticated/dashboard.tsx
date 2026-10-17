import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { format, isToday, startOfWeek, subWeeks } from "date-fns";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Users, ClipboardList, CheckCircle2, AlertTriangle, Percent, FileText } from "lucide-react";
import { useMe } from "@/lib/me";
import { fetchClassBundle, studentSummary } from "@/lib/data";
import { supabase } from "@/integrations/supabase/client";
import { EngagementBadge, ErrorNote, Loading, StatCard, EmptyState } from "@/components/ui-kit";
import { StudentOverview } from "@/components/StudentOverview";
import { ExamCountdown } from "@/components/ExamCountdown";
import { SCHOOL } from "@/lib/school";
import { SchoolLogo } from "@/components/SchoolMark";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — SRSV Class 10" }, { name: "description", content: "Your Class 10 ICSE dashboard." }] }),
  component: Dashboard,
});

function Welcome({ name }: { name: string }) {
  return (
    <div className="relative mb-6 overflow-hidden rounded-3xl bg-hero p-6 text-navy-foreground shadow-elegant md:p-8 animate-fade-up">
      <div className="pointer-events-none absolute -right-20 -top-20 size-72 rounded-full bg-teal/30 blur-3xl" />
      <div className="relative flex flex-wrap items-center gap-6">
        <SchoolLogo className="size-20" />
        <div className="flex-1">
          <p className="text-xs font-semibold tracking-[0.2em] text-gold">{SCHOOL.sub}</p>
          <h1 className="mt-1 text-2xl font-semibold md:text-3xl">Welcome, {name}</h1>
          <p className="mt-1 text-sm opacity-80">{SCHOOL.tagline}</p>
        </div>
        <div className="w-full md:w-80"><ExamCountdown /></div>
      </div>
    </div>
  );
}

function Dashboard() {
  const { data: me } = useMe();
  if (!me) return null;
  if (me.isStaff) return <><Welcome name={me.fullName} /><TeacherDashboard /></>;
  if (me.isStudent) return <><Welcome name={me.fullName} /><StudentOverview studentId={me.id} /></>;
  if (me.isParent) return <><Welcome name={me.fullName} /><ParentDashboard parentId={me.id} /></>;
  return (
    <EmptyState title="Your account is waiting for access" text="An administrator needs to assign you a role (teacher, student or parent) before you can use the portal." />
  );
}

function ParentDashboard({ parentId }: { parentId: string }) {
  const q = useQuery({
    queryKey: ["children", parentId],
    queryFn: async () => {
      const { data, error } = await supabase.from("parent_links").select("student_id, profiles(id, full_name, student_code)").eq("parent_id", parentId);
      if (error) throw error;
      return data ?? [];
    },
  });
  if (q.isLoading) return <Loading />;
  if (!q.data?.length) return <EmptyState title="No linked student" text="Ask the school to link your child's account to yours." />;
  return (
    <div className="space-y-10">
      {q.data.map((c) => (
        <section key={c.student_id}>
          <h2 className="mb-4 text-xl font-semibold">{c.profiles?.full_name} <span className="text-sm text-muted-foreground">({c.profiles?.student_code})</span></h2>
          <StudentOverview studentId={c.student_id} />
        </section>
      ))}
    </div>
  );
}

function TeacherDashboard() {
  const q = useQuery({ queryKey: ["class-bundle"], queryFn: fetchClassBundle });
  const extra = useQuery({
    queryKey: ["dash-extra"],
    queryFn: async () => {
      const [r, a] = await Promise.all([
        supabase.from("resources").select("id,title,resource_type,created_at").order("created_at", { ascending: false }).limit(5),
        supabase.from("announcements").select("id,title,published,created_at").order("created_at", { ascending: false }).limit(4),
      ]);
      return { resources: r.data ?? [], announcements: a.data ?? [] };
    },
  });
  if (q.isLoading) return <Loading />;
  if (q.error) return <ErrorNote error={q.error} />;
  const b = q.data!;
  const active = b.students.filter((s) => s.is_active);
  const today = b.assignments.filter((a) => isToday(new Date(a.due_at)));
  const todaySubs = b.submissions.filter((s) => today.some((a) => a.id === s.assignment_id));
  const expected = today.length * active.length;
  const now = new Date();
  const dueSoFar = b.assignments.filter((a) => new Date(a.due_at) < now);
  const totalExpected = dueSoFar.length * active.length;
  const doneDue = b.submissions.filter((s) => dueSoFar.some((a) => a.id === s.assignment_id)).length;
  const summaries = active.map((s) => ({ s, ...studentSummary(b, s.id) }));
  const support = summaries.filter((x) => ["Frequently missing work", "Academic support recommended", "Needs attention"].includes(x.engagement.category));

  const weeks = Array.from({ length: 8 }, (_, i) => startOfWeek(subWeeks(now, 7 - i), { weekStartsOn: 1 }));
  const weekly = weeks.map((w, i) => {
    const end = weeks[i + 1] ?? new Date(8.64e15);
    return { week: format(w, "d MMM"), submissions: b.submissions.filter((s) => new Date(s.submitted_at) >= w && new Date(s.submitted_at) < end).length };
  });
  const latestTest = b.tests[b.tests.length - 1];
  const latestMarks = latestTest ? b.marks.filter((m) => m.test_id === latestTest.id) : [];
  const latestAvg = latestMarks.length ? Math.round(latestMarks.reduce((x, m) => x + Number(m.marks), 0) / latestMarks.length / Number(latestTest!.max_marks) * 100) : null;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard label="Students" value={active.length} hint={`${b.students.length - active.length} inactive`} icon={<Users />} />
        <StatCard label="Due today" value={today.length} hint={`${todaySubs.length}/${expected || 0} submitted`} icon={<ClipboardList />} tone="teal" />
        <StatCard label="Completed (due)" value={doneDue} icon={<CheckCircle2 />} tone="success" />
        <StatCard label="Missing" value={Math.max(totalExpected - doneDue, 0)} icon={<AlertTriangle />} tone="destructive" />
        <StatCard label="Completion rate" value={totalExpected ? `${Math.round((doneDue / totalExpected) * 100)}%` : "—"} icon={<Percent />} tone="gold" />
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="card-surface p-5 lg:col-span-2">
          <h3 className="mb-3 font-semibold">Weekly submission trend</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={weekly}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="week" tick={{ fontSize: 11 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="submissions" fill="var(--chart-1)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="card-surface p-5">
          <h3 className="mb-3 font-semibold">Latest test</h3>
          {latestTest ? (
            <>
              <p className="font-display text-lg">{latestTest.title}</p>
              <p className="text-xs text-muted-foreground">{format(new Date(latestTest.test_date), "d MMM yyyy")} · {latestMarks.length} marked</p>
              <p className="mt-4 font-display text-4xl font-semibold text-primary">{latestAvg ?? "—"}{latestAvg !== null && "%"}</p>
              <p className="text-xs text-muted-foreground">class average</p>
            </>
          ) : <p className="text-sm text-muted-foreground">No tests recorded yet.</p>}
        </div>
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="card-surface p-5 lg:col-span-2">
          <h3 className="mb-3 font-semibold">Students who may need support</h3>
          {support.length ? (
            <ul className="divide-y">
              {support.slice(0, 8).map(({ s, engagement }) => (
                <li key={s.id} className="flex items-start justify-between gap-3 py-3">
                  <div>
                    <Link to="/students/$id" params={{ id: s.id }} className="font-medium hover:text-primary">{s.full_name}</Link>
                    <p className="text-xs text-muted-foreground">{engagement.reasons.join(" ")}</p>
                  </div>
                  <EngagementBadge category={engagement.category} />
                </li>
              ))}
            </ul>
          ) : <p className="text-sm text-muted-foreground">No students currently flagged by the evidence.</p>}
        </div>
        <div className="card-surface p-5">
          <h3 className="mb-3 font-semibold">Recent uploads</h3>
          {extra.data?.resources.length ? (
            <ul className="space-y-2">
              {extra.data.resources.map((r) => (
                <li key={r.id} className="flex items-center gap-2 text-sm">
                  <FileText className="size-4 text-teal" />
                  <span className="flex-1 truncate">{r.title}</span>
                  <span className="text-xs text-muted-foreground">{format(new Date(r.created_at), "d MMM")}</span>
                </li>
              ))}
            </ul>
          ) : <p className="text-sm text-muted-foreground">No resources yet.</p>}
          <h3 className="mb-3 mt-6 font-semibold">Announcements</h3>
          {extra.data?.announcements.length ? (
            <ul className="space-y-2 text-sm">
              {extra.data.announcements.map((a) => (
                <li key={a.id} className="flex justify-between gap-2"><span className="truncate">{a.title}</span><span className="text-xs text-muted-foreground">{a.published ? "Live" : "Draft"}</span></li>
              ))}
            </ul>
          ) : <p className="text-sm text-muted-foreground">None yet.</p>}
        </div>
      </div>
    </div>
  );
}
