import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { BookOpenCheck, LineChart, Bot, BellRing, Megaphone, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SchoolLogo } from "@/components/SchoolMark";
import { ExamCountdown } from "@/components/ExamCountdown";
import { SCHOOL } from "@/lib/school";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SRSV Class 10 ICSE — Learn, Improve, Achieve" },
      { name: "description", content: "Daily work, Mathematics resources and progress tracking for Class 10 ICSE students of Sri Ramakrishna Sharadadevi Vidyamandira." },
      { property: "og:title", content: "SRSV Class 10 ICSE Progress Portal" },
      { property: "og:description", content: SCHOOL.tagline },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const features = [
  { icon: BookOpenCheck, title: "Daily work", text: "Assignments with deadlines, PDF submissions and teacher review." },
  { icon: LineChart, title: "Real progress", text: "On-time rates, test trends and chapter strengths from actual records." },
  { icon: Bot, title: "AI Maths tutor", text: "Step-by-step help grounded in the teacher's approved materials." },
  { icon: BellRing, title: "Parent updates", text: "Reminders for overdue work, sent only after the grace period." },
];

function Index() {
  const { data: news } = useQuery({
    queryKey: ["public-announcements"],
    queryFn: async () => {
      const { data } = await supabase.from("announcements").select("id,title,body,created_at").eq("published", true).order("pinned", { ascending: false }).order("created_at", { ascending: false }).limit(3);
      return data ?? [];
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <section className="relative overflow-hidden bg-hero text-navy-foreground">
        <div className="pointer-events-none absolute -right-32 -top-32 size-[28rem] rounded-full bg-teal/30 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-40 left-10 size-[24rem] rounded-full bg-gold/20 blur-3xl" />
        <header className="relative mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <div className="flex items-center gap-3">
            <SchoolLogo className="size-11" />
            <span className="hidden text-sm font-semibold tracking-wide sm:block">SRSV · ICSE 10</span>
          </div>
          <Button variant="gold" asChild>
            <Link to="/auth">Sign in</Link>
          </Button>
        </header>
        <div className="relative mx-auto grid max-w-6xl gap-10 px-6 pb-20 pt-10 md:grid-cols-[1.3fr_1fr] md:items-center">
          <div className="animate-fade-up">
            <SchoolLogo className="mb-6 size-28 shadow-elegant" />
            <p className="mb-3 inline-block rounded-full border border-gold/50 bg-gold/15 px-3 py-1 text-xs font-semibold tracking-[0.2em] text-gold">{SCHOOL.sub}</p>
            <h1 className="text-4xl font-semibold leading-tight md:text-5xl">{SCHOOL.name}</h1>
            <p className="mt-4 max-w-xl text-lg opacity-85">{SCHOOL.tagline}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button variant="gold" size="lg" asChild>
                <Link to="/auth">
                  Enter the portal <ArrowRight />
                </Link>
              </Button>
            </div>
          </div>
          <div className="space-y-4 animate-fade-up">
            <ExamCountdown />
            <div className="rounded-2xl border border-navy-foreground/20 bg-navy-foreground/10 p-5 backdrop-blur">
              <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider opacity-80">
                <Megaphone className="size-4" /> School announcements
              </p>
              {news && news.length > 0 ? (
                <ul className="mt-3 space-y-3">
                  {news.map((n) => (
                    <li key={n.id}>
                      <p className="font-semibold">{n.title}</p>
                      <p className="line-clamp-2 text-sm opacity-80">{n.body}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-3 text-sm opacity-75">No announcements right now.</p>
              )}
            </div>
          </div>
        </div>
      </section>
      <section className="mx-auto grid max-w-6xl gap-5 px-6 py-16 sm:grid-cols-2 lg:grid-cols-4">
        {features.map((f) => (
          <div key={f.title} className="card-surface card-hover p-6">
            <span className="grid size-11 place-items-center rounded-xl bg-hero text-navy-foreground shadow-elegant">
              <f.icon className="size-5" />
            </span>
            <h3 className="mt-4 text-lg font-semibold">{f.title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{f.text}</p>
          </div>
        ))}
      </section>
      <footer className="border-t py-6 text-center text-xs text-muted-foreground">
        © {SCHOOL.name} · Kalludi, Gowribidanur
      </footer>
    </div>
  );
}
