import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import { Sparkles, Square } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/ui-kit";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/_authenticated/math-explainer")({
  head: () => ({
    meta: [
      { title: "Maths AI Explainer — SRSV Class 10 ICSE" },
      { name: "description", content: "Get clear step-by-step explanations for ICSE Class 10 maths problems." },
      { property: "og:title", content: "Maths AI Explainer — SRSV Class 10 ICSE" },
      { property: "og:description", content: "Step-by-step ICSE maths explanations and attempt checking." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: MathExplainer,
});

const MODES = [
  { id: "full", label: "Full solution" },
  { id: "check", label: "Check my attempt" },
  { id: "hint", label: "Just a hint" },
] as const;

function MathExplainer() {
  const { data: chapters } = useQuery({
    queryKey: ["chapters-list"],
    queryFn: async () => (await supabase.from("chapters").select("id,name").order("name")).data ?? [],
  });
  const [chapter, setChapter] = useState("");
  const [problem, setProblem] = useState("");
  const [attempt, setAttempt] = useState("");
  const [mode, setMode] = useState<(typeof MODES)[number]["id"]>("full");
  const [answer, setAnswer] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  async function explain() {
    setError("");
    setAnswer("");
    if (!problem.trim()) return setError("Please type the problem first.");
    if (mode === "check" && !attempt.trim()) return setError("Please add your attempt to be checked.");
    setBusy(true);
    const ac = new AbortController();
    abortRef.current = ac;
    try {
      const { data } = await supabase.auth.getSession();
      const res = await fetch("/api/math-explain", {
        method: "POST",
        signal: ac.signal,
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${data.session?.access_token ?? ""}` },
        body: JSON.stringify({ problem, attempt, chapter, mode }),
      });
      if (!res.ok || !res.body) {
        setError(res.status === 402 ? "AI credits have run out. Please ask your teacher." : res.status === 429 ? "Too many requests — please wait a minute." : (await res.text()) || "Something went wrong.");
        return;
      }
      const reader = res.body.getReader();
      const dec = new TextDecoder();
      let text = "";
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        text += dec.decode(value, { stream: true });
        setAnswer(text);
      }
      if (!text.trim()) setError("No explanation was returned. Please try again later.");
    } catch (e) {
      if ((e as Error).name !== "AbortError") setError("Could not reach the AI explainer.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Maths AI Explainer" subtitle="Type an ICSE Class 10 maths problem — or your attempt — and get a clear, step-by-step explanation." />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,420px)_1fr]">
        <div className="card-surface space-y-4 rounded-2xl p-5">
          <div className="flex flex-wrap gap-2">
            {MODES.map((m) => (
              <Button key={m.id} size="sm" variant={mode === m.id ? "default" : "outline"} onClick={() => setMode(m.id)}>
                {m.label}
              </Button>
            ))}
          </div>
          <label className="block text-sm font-medium">
            Chapter (optional)
            <select value={chapter} onChange={(e) => setChapter(e.target.value)} className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
              <option value="">Any chapter</option>
              {chapters?.map((c) => <option key={c.id} value={c.name}>{c.name}</option>)}
            </select>
          </label>
          <label className="block text-sm font-medium">
            Problem
            <Textarea rows={5} value={problem} onChange={(e) => setProblem(e.target.value)} placeholder="e.g. Solve x² − 5x + 6 = 0 using the quadratic formula." className="mt-1" />
          </label>
          <label className="block text-sm font-medium">
            Your attempt {mode === "check" ? "" : "(optional)"}
            <Textarea rows={5} value={attempt} onChange={(e) => setAttempt(e.target.value)} placeholder="Write your steps here, one per line." className="mt-1" />
          </label>
          {error && <p className="text-sm text-destructive">{error}</p>}
          {busy ? (
            <Button variant="outline" className="w-full" onClick={() => abortRef.current?.abort()}>
              <Square className="size-4" /> Stop
            </Button>
          ) : (
            <Button variant="gold" className="w-full" onClick={explain}>
              <Sparkles className="size-4" /> Explain step by step
            </Button>
          )}
        </div>
        <div className="card-surface min-h-[300px] rounded-2xl p-6">
          {answer ? (
            <article className="prose prose-sm max-w-none dark:prose-invert [&_h2]:mt-5 [&_h2]:text-base [&_h2]:font-semibold [&_ol]:list-decimal [&_ol]:pl-5 [&_ul]:list-disc [&_ul]:pl-5 [&_p]:my-2">
              <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>{answer}</ReactMarkdown>
            </article>
          ) : (
            <p className="text-sm text-muted-foreground">{busy ? "Thinking through your problem…" : "Your explanation will appear here. AI can make mistakes — always check with your teacher."}</p>
          )}
        </div>
      </div>
    </div>
  );
}
