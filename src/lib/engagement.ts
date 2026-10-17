export type AssignmentLike = { id: string; due_at: string; max_marks: number };
export type SubmissionLike = {
  assignment_id: string;
  submitted_at: string;
  status: "submitted" | "under_review" | "corrections_required" | "reviewed";
  marks: number | null;
};

export type WorkStatus =
  | "not_started"
  | "submitted"
  | "submitted_late"
  | "under_review"
  | "corrections_required"
  | "reviewed"
  | "missing";

export const STATUS_LABEL: Record<WorkStatus, string> = {
  not_started: "Not started",
  submitted: "Submitted",
  submitted_late: "Submitted late",
  under_review: "Under review",
  corrections_required: "Corrections required",
  reviewed: "Reviewed",
  missing: "Missing / overdue",
};

export function workStatus(a: AssignmentLike, s: SubmissionLike | undefined, now = new Date()): WorkStatus {
  if (!s) return new Date(a.due_at) < now ? "missing" : "not_started";
  if (s.status === "reviewed") return "reviewed";
  if (s.status === "corrections_required") return "corrections_required";
  if (s.status === "under_review") return "under_review";
  return new Date(s.submitted_at) > new Date(a.due_at) ? "submitted_late" : "submitted";
}

export type StudentStats = {
  assigned: number;
  submitted: number;
  pending: number;
  missing: number;
  late: number;
  onTimePct: number | null;
  testPcts: number[];
  avgTestPct: number | null;
};

export function computeStats(
  assignments: AssignmentLike[],
  subs: SubmissionLike[],
  testPcts: number[],
  now = new Date(),
): StudentStats {
  const byA = new Map(subs.map((s) => [s.assignment_id, s]));
  let submitted = 0, pending = 0, missing = 0, late = 0, onTime = 0, dueCount = 0;
  for (const a of assignments) {
    const s = byA.get(a.id);
    const st = workStatus(a, s, now);
    const due = new Date(a.due_at) < now;
    if (due) dueCount++;
    if (st === "missing") missing++;
    else if (st === "not_started") pending++;
    else {
      submitted++;
      if (s && new Date(s.submitted_at) > new Date(a.due_at)) late++;
      else onTime++;
    }
  }
  const judged = onTime + late + missing;
  return {
    assigned: assignments.length,
    submitted,
    pending,
    missing,
    late,
    onTimePct: judged ? Math.round((onTime / judged) * 100) : null,
    testPcts,
    avgTestPct: testPcts.length ? Math.round(testPcts.reduce((x, y) => x + y, 0) / testPcts.length) : null,
  };
}

export type Engagement =
  | "Consistent"
  | "Needs attention"
  | "Frequently missing work"
  | "Improving"
  | "Academic support recommended"
  | "Not enough data";

/** Classifies a student from recorded evidence only, returning the reasons used. */
export function classifyEngagement(st: StudentStats): { category: Engagement; reasons: string[] } {
  const reasons: string[] = [];
  const due = st.submitted + st.missing;
  if (due === 0 && st.testPcts.length === 0) {
    return { category: "Not enough data", reasons: ["No assignments past their deadline and no test marks recorded yet."] };
  }
  if (st.missing >= 3) {
    reasons.push(`${st.missing} assignments are missing after their deadline.`);
    return { category: "Frequently missing work", reasons };
  }
  if (st.avgTestPct !== null && st.avgTestPct < 40) {
    reasons.push(`Average test score is ${st.avgTestPct}% across ${st.testPcts.length} test(s).`);
    return { category: "Academic support recommended", reasons };
  }
  const t = st.testPcts;
  if (t.length >= 2 && t[t.length - 1] - t[t.length - 2] >= 10) {
    reasons.push(`Latest test rose from ${Math.round(t[t.length - 2])}% to ${Math.round(t[t.length - 1])}%.`);
    return { category: "Improving", reasons };
  }
  if (st.onTimePct !== null && st.onTimePct >= 80 && st.missing === 0) {
    reasons.push(`${st.onTimePct}% of due work submitted on time with no missing assignments.`);
    return { category: "Consistent", reasons };
  }
  if (st.missing > 0) reasons.push(`${st.missing} missing assignment(s).`);
  if (st.late > 0) reasons.push(`${st.late} late submission(s).`);
  if (st.onTimePct !== null) reasons.push(`On-time rate is ${st.onTimePct}%.`);
  if (st.avgTestPct !== null) reasons.push(`Average test score ${st.avgTestPct}%.`);
  return { category: "Needs attention", reasons };
}
