import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { STATUS_LABEL, type WorkStatus, type Engagement } from "@/lib/engagement";
import { Inbox } from "lucide-react";

export function PageHeader({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4 animate-fade-up">
      <div>
        <h1 className="text-3xl font-semibold text-foreground">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2 no-print">{actions}</div>}
    </div>
  );
}

export function StatCard({ label, value, hint, icon, tone = "primary" }: { label: string; value: ReactNode; hint?: string; icon?: ReactNode; tone?: "primary" | "teal" | "gold" | "destructive" | "success" }) {
  const toneCls = {
    primary: "bg-primary/10 text-primary",
    teal: "bg-teal/15 text-teal",
    gold: "bg-gold/20 text-gold-foreground dark:text-gold",
    destructive: "bg-destructive/10 text-destructive",
    success: "bg-success/15 text-success",
  }[tone];
  return (
    <div className="card-surface card-hover p-5 animate-fade-up">
      <div className="flex items-start justify-between">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
        {icon && <span className={cn("grid size-9 place-items-center rounded-lg [&_svg]:size-4", toneCls)}>{icon}</span>}
      </div>
      <p className="mt-3 font-display text-3xl font-semibold text-foreground">{value}</p>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

export function ProgressRing({ value, size = 120, label, stroke = 10 }: { value: number | null; size?: number; label?: string; stroke?: number }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const v = value ?? 0;
  return (
    <div className="relative inline-grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} strokeWidth={stroke} className="fill-none stroke-muted" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c - (c * v) / 100}
          className="fill-none stroke-teal transition-all duration-700"
        />
      </svg>
      <div className="absolute text-center">
        <p className="font-display text-2xl font-semibold text-foreground">{value === null ? "—" : `${value}%`}</p>
        {label && <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>}
      </div>
    </div>
  );
}

const statusTone: Record<WorkStatus, string> = {
  not_started: "bg-muted text-muted-foreground",
  submitted: "bg-success/15 text-success",
  submitted_late: "bg-warning/20 text-foreground",
  under_review: "bg-primary/10 text-primary",
  corrections_required: "bg-gold/25 text-foreground",
  reviewed: "bg-teal/15 text-teal",
  missing: "bg-destructive/10 text-destructive",
};
export function StatusBadge({ status }: { status: WorkStatus }) {
  return <span className={cn("inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium", statusTone[status])}>{STATUS_LABEL[status]}</span>;
}

const engTone: Record<Engagement, string> = {
  Consistent: "bg-success/15 text-success",
  Improving: "bg-teal/15 text-teal",
  "Needs attention": "bg-warning/20 text-foreground",
  "Frequently missing work": "bg-destructive/10 text-destructive",
  "Academic support recommended": "bg-gold/25 text-foreground",
  "Not enough data": "bg-muted text-muted-foreground",
};
export function EngagementBadge({ category }: { category: Engagement }) {
  return <span className={cn("inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium", engTone[category])}>{category}</span>;
}

export function EmptyState({ title, text, action }: { title: string; text?: string; action?: ReactNode }) {
  return (
    <div className="card-surface flex flex-col items-center gap-3 p-10 text-center">
      <span className="grid size-14 place-items-center rounded-2xl bg-hero text-navy-foreground shadow-elegant">
        <Inbox className="size-6" />
      </span>
      <p className="font-display text-lg font-semibold">{title}</p>
      {text && <p className="max-w-sm text-sm text-muted-foreground">{text}</p>}
      {action}
    </div>
  );
}

export function Loading() {
  return (
    <div className="grid place-items-center py-20">
      <div className="size-10 animate-spin rounded-full border-4 border-muted border-t-primary" />
    </div>
  );
}

export function ErrorNote({ error }: { error: unknown }) {
  return <div className="card-surface border-destructive/40 p-4 text-sm text-destructive">{error instanceof Error ? error.message : "Something went wrong."}</div>;
}
