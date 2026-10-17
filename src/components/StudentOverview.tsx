import { useQuery } from "@tanstack/react-query";
import { format, startOfWeek, subWeeks } from "date-fns";
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ClipboardCheck, AlertTriangle, Clock, ListTodo, Printer, Download } from "lucide-react";
import { fetchStudentBundle, fetchSubjects, studentSummary, downloadCsv } from "@/lib/data";
import { workStatus, STATUS_LABEL } from "@/lib/engagement";
import { EngagementBadge, ErrorNote, Loading, ProgressRing, StatCard, StatusBadge, EmptyState } from "./ui-kit";
import { Button } from "./ui/button";

export function StudentOverview({ studentId, showActions = false }: { studentId: string; showActions?: boolean }) {
  const q = useQuery({ queryKey: ["student-bundle", studentId], queryFn: () => fetchStudentBundle(studentId) });
  const subjects = useQuery({ queryKey: ["subjects"], queryFn: fetchSubjects });
  if (q.isLoading) return <Loading />;
  if (q.error) return <ErrorNote error={q.error} />;
  const b = q.data!;
  const { stats, engagement, subs, marks } = studentSummary(b, studentId);
  const chapterName = new Map((subjects.data ?? []).flatMap((s) => s.chapters.map((c) => [c.id, c.name] as const)));
  const subByA = new Map(subs.map((s) => [s.assignment_id, s]));

  // Chapter-wise performance from reviewed assignment marks and test marks.
  const chap = new Map<string, { sum: number; n: number }>();
  const add = (id: string | null, pct: number) => {
    if (!id) return;
    const c = chap.get(id) ?? { sum: 0, n: 0 };
    c.sum += pct;
    c.n++;
    chap.set(id, c);
  };
  for (const a of b.assignments) {
    const s = subByA.get(a.id);
    if (s?.marks != null) add(a.chapter_id, (Number(s.marks) / Number(a.max_marks)) * 100);
  }
  for (const m of marks) add(m.test.chapter_id, (Number(m.marks) / Number(m.test.max_marks)) * 100);
  const chapters = [...chap.entries()].map(([id, c]) => ({ name: chapterName.get(id) ?? "Chapter", pct: Math.round(c.sum / c.n) })).sort((x, y) => y.pct - x.pct);
  const weak = chapters.filter((c) => c.pct < 60);

  const weeks = Array.from({ length: 8 }, (_, i) => startOfWeek(subWeeks(new Date(), 7 - i), { weekStartsOn: 1 }));
  const weekly = weeks.map((w, i) => {
    const end = weeks[i + 1] ?? new Date(8.64e15);
    return { week: format(w, "d MMM"), submissions: subs.filter((s) => new Date(s.submitted_at) >= w && new Date(s.submitted_at) < end).length };
  });
  const trend = marks.map((m) => ({ name: m.test.title, pct: Math.round((Number(m.marks) / Number(m.test.max_marks)) * 100) }));
  const pending = b.assignments.filter((a) => ["not_started", "corrections_required", "missing"].includes(workStatus(a, subByA.get(a.id))));
  const feedback = subs.filter((s) => s.feedback).sort((x, y) => (y.reviewed_at ?? "").localeCompare(x.reviewed_at ?? ""));

  function exportCsv() {
    downloadCsv(`${b.profile?.student_code ?? "student"}-report.csv`, [
      ["Assignment", "Due", "Status", "Marks", "Max"],
      ...b.assignments.map((a) => {
        const s = subByA.get(a.id);
        return [a.title, a.due_at, STATUS_LABEL[workStatus(a, s)], s?.marks ?? "", a.max_marks];
      }),
      [],
      ["Test", "Date", "Marks", "Max"],
      ...marks.map((m) => [m.test.title, m.test.test_date, m.marks, m.test.max_marks]),
    ]);
  }

  return (
    <div className="space-y-6">
      <div className="card-surface flex flex-wrap items-center gap-6 p-6">
        <ProgressRing value={stats.onTimePct} label="On time" />
        <ProgressRing value={stats.avgTestPct} label="Avg test" />
        <div className="min-w-[220px] flex-1">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Engagement</p>
          <div className="mt-1"><EngagementBadge category={engagement.category} /></div>
          <ul className="mt-2 list-disc space-y-0.5 pl-4 text-sm text-muted-foreground">
            {engagement.reasons.map((r) => <li key={r}>{r}</li>)}
          </ul>
        </div>
        {showActions && (
          <div className="no-print flex gap-2">
            <Button variant="outline" onClick={exportCsv}><Download /> CSV</Button>
            <Button variant="outline" onClick={() => window.print()}><Printer /> Print report</Button>
          </div>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Assigned" value={stats.assigned} icon={<ListTodo />} />
        <StatCard label="Submitted" value={stats.submitted} hint={`${stats.late} late`} icon={<ClipboardCheck />} tone="success" />
        <StatCard label="Pending" value={stats.pending} icon={<Clock />} tone="gold" />
        <StatCard label="Missing" value={stats.missing} icon={<AlertTriangle />} tone="destructive" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card-surface p-5">
          <h3 className="mb-3 font-semibold">Test score trend</h3>
          {trend.length ? (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={trend}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Line type="monotone" dataKey="pct" stroke="var(--chart-1)" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : <p className="text-sm text-muted-foreground">No test marks recorded yet.</p>}
        </div>
        <div className="card-surface p-5">
          <h3 className="mb-3 font-semibold">Weekly submissions</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={weekly}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="week" tick={{ fontSize: 11 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="submissions" fill="var(--chart-2)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="card-surface p-5">
          <h3 className="mb-3 font-semibold">Chapter strengths</h3>
          {chapters.length ? (
            <ul className="space-y-3">
              {chapters.map((c) => (
                <li key={c.name}>
                  <div className="flex justify-between text-sm"><span>{c.name}</span><span className="font-semibold">{c.pct}%</span></div>
                  <div className="mt-1 h-2 rounded-full bg-muted"><div className="h-2 rounded-full bg-teal" style={{ width: `${c.pct}%` }} /></div>
                </li>
              ))}
            </ul>
          ) : <p className="text-sm text-muted-foreground">Appears once marked work exists.</p>}
          {weak.length > 0 && (
            <p className="mt-4 rounded-lg bg-gold/15 p-3 text-sm">
              <strong>Recommended revision:</strong> {weak.map((w) => w.name).join(", ")}
            </p>
          )}
        </div>
        <div className="card-surface p-5">
          <h3 className="mb-3 font-semibold">Pending work</h3>
          {pending.length ? (
            <ul className="space-y-2">
              {pending.slice(0, 8).map((a) => (
                <li key={a.id} className="flex items-center justify-between gap-2 text-sm">
                  <span className="truncate">{a.title}<span className="block text-xs text-muted-foreground">Due {format(new Date(a.due_at), "d MMM, h:mm a")}</span></span>
                  <StatusBadge status={workStatus(a, subByA.get(a.id))} />
                </li>
              ))}
            </ul>
          ) : <p className="text-sm text-muted-foreground">Nothing pending. 🎉</p>}
        </div>
        <div className="card-surface p-5">
          <h3 className="mb-3 font-semibold">Teacher remarks</h3>
          {feedback.length ? (
            <ul className="space-y-3">
              {feedback.slice(0, 5).map((s) => (
                <li key={s.id} className="border-l-2 border-gold pl-3 text-sm">
                  <p>{s.feedback}</p>
                  <p className="text-xs text-muted-foreground">{b.assignments.find((a) => a.id === s.assignment_id)?.title}</p>
                </li>
              ))}
            </ul>
          ) : <p className="text-sm text-muted-foreground">No remarks yet.</p>}
        </div>
      </div>

      <div className="card-surface p-5">
        <h3 className="mb-3 font-semibold">Recent activity</h3>
        {b.activity.length ? (
          <ol className="relative space-y-4 border-l pl-5">
            {b.activity.map((a) => (
              <li key={a.id} className="text-sm">
                <span className="absolute -left-1.5 mt-1 size-3 rounded-full bg-primary" />
                <p className="font-medium">{a.action}</p>
                <p className="text-xs text-muted-foreground">{format(new Date(a.created_at), "d MMM yyyy, h:mm a")}</p>
              </li>
            ))}
          </ol>
        ) : <EmptyState title="No activity yet" text="Submissions and resource views will appear here." />}
      </div>
    </div>
  );
}
