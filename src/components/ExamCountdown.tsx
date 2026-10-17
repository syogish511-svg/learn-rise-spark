import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { CalendarClock } from "lucide-react";

type Exam = { date: string; label: string; source_url?: string };

export function ExamCountdown({ compact = false }: { compact?: boolean }) {
  const { data } = useQuery({
    queryKey: ["setting", "exam_date"],
    queryFn: async () => {
      const { data } = await supabase.from("app_settings").select("value").eq("key", "exam_date").maybeSingle();
      return (data?.value as Exam | null) ?? null;
    },
  });
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    setNow(Date.now());
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  if (!data?.date || now === null) return null;
  const diff = new Date(data.date).getTime() - now;
  if (diff <= 0) return null;
  const parts = [
    ["Days", Math.floor(diff / 86400000)],
    ["Hours", Math.floor((diff / 3600000) % 24)],
    ["Min", Math.floor((diff / 60000) % 60)],
    ["Sec", Math.floor((diff / 1000) % 60)],
  ] as const;
  return (
    <div className={compact ? "card-surface p-5" : "rounded-2xl border border-navy-foreground/20 bg-navy-foreground/10 p-5 text-navy-foreground backdrop-blur"}>
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider opacity-80">
        <CalendarClock className="size-4" /> {data.label}
      </div>
      <div className="mt-3 grid grid-cols-4 gap-2">
        {parts.map(([l, v]) => (
          <div key={l} className="rounded-xl bg-gold-gradient px-2 py-3 text-center text-gold-foreground">
            <p className="font-display text-2xl font-bold tabular-nums">{String(v).padStart(2, "0")}</p>
            <p className="text-[10px] font-semibold uppercase">{l}</p>
          </div>
        ))}
      </div>
      {data.source_url && (
        <a href={data.source_url} target="_blank" rel="noreferrer" className="mt-2 inline-block text-xs underline opacity-80">
          Official source
        </a>
      )}
    </div>
  );
}
