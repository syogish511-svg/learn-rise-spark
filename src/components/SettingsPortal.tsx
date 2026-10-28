import { useState } from "react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Plus, Pencil } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useMe, audit } from "@/lib/me";
import { check, portalQuery } from "@/lib/portal";
import { safeExternalUrl } from "@/lib/portal-validation";
import { Button } from "@/components/ui/button";
import { PageHeader, EmptyState } from "@/components/ui-kit";
import { Editor, Field, Choice } from "./portal-controls";

export const settingsQuery = {
  queryKey: ["portal-settings"],
  queryFn: async () => {
    const [settings, logs] = await Promise.all([
      supabase.from("app_settings").select("*"),
      supabase.from("audit_log").select("*").order("created_at", { ascending: false }).limit(100),
    ]);
    check(settings.error); check(logs.error);
    return { settings: settings.data ?? [], logs: logs.data ?? [] };
  },
};

export function SettingsPortal() {
  const { data: me } = useMe();
  const { data } = useSuspenseQuery(settingsQuery);
  const { data: portal } = useSuspenseQuery(portalQuery);
  const [editor, setEditor] = useState<"exam" | "subject" | "chapter" | null>(null);
  const raw = data.settings.find(s => s.key === "exam_date")?.value;
  const exam = raw && typeof raw === "object" && !Array.isArray(raw) ? raw : {};
  const text = (key: string) => typeof exam[key] === "string" ? String(exam[key]) : "";
  if (!me?.isStaff) return <EmptyState title="Teacher access required" />;
  return <div className="space-y-8">
    <PageHeader title="Settings" />
    <section className="space-y-3 border-b pb-6">
      <div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-xl font-semibold">Examination countdown</h2><Button variant="outline" onClick={() => setEditor("exam")}><Pencil />Edit examination</Button></div>
      <p>{text("label") || "No examination configured"}</p><p className="text-sm text-muted-foreground">{text("date")}</p>
    </section>
    <section className="space-y-4 border-b pb-6">
      <div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-xl font-semibold">Curriculum</h2><div className="flex gap-2"><Button variant="outline" onClick={() => setEditor("subject")}><Plus />Subject</Button><Button variant="outline" onClick={() => setEditor("chapter")}><Plus />Chapter</Button></div></div>
      {portal.subjects.map(s => <div key={s.id}><h3 className="font-semibold">{s.name}</h3><ul className="mt-2 grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">{s.chapters.map(c => <li key={c.id}>{c.name}</li>)}</ul></div>)}
    </section>
    <section className="space-y-3"><h2 className="text-xl font-semibold">Activity audit</h2>{data.logs.length ? <div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr className="border-b"><th className="p-2">Date</th><th className="p-2">Action</th><th className="p-2">Details</th></tr></thead><tbody>{data.logs.map(l => <tr key={l.id} className="border-b"><td className="whitespace-nowrap p-2">{new Date(l.created_at).toLocaleString()}</td><td className="p-2">{l.action}</td><td className="max-w-lg break-words p-2">{JSON.stringify(l.details)}</td></tr>)}</tbody></table></div> : <EmptyState title="No audit records" />}</section>
    {editor && <Editor title={editor === "exam" ? "Examination countdown" : editor === "subject" ? "Add subject" : "Add chapter"} open onClose={() => setEditor(null)} onSave={async f => {
      if (editor === "exam") {
        const source = String(f.get("source_url")).trim();
        const result = await supabase.from("app_settings").upsert({ key: "exam_date", value: { label: String(f.get("label")).trim(), date: String(f.get("date")), ...(source ? { source_url: safeExternalUrl(source) } : {}) }, is_public: true, updated_at: new Date().toISOString() });
        check(result.error);
      } else if (editor === "subject") {
        check((await supabase.from("subjects").insert({ name: String(f.get("name")).trim() })).error);
      } else {
        const subject = String(f.get("subject_id"));
        if (!portal.subjects.some(s => s.id === subject)) throw new Error("Choose a subject.");
        check((await supabase.from("chapters").insert({ name: String(f.get("name")).trim(), subject_id: subject })).error);
      }
      await audit(`settings.${editor}`);
    }}>{editor === "exam" ? <><Field label="Examination name" name="label" value={text("label")} required /><Field label="Examination date" name="date" type="date" value={text("date").slice(0, 10)} required /><Field label="Official source URL" name="source_url" type="url" value={text("source_url")} /></> : <><Field label="Name" name="name" required />{editor === "chapter" && <Choice label="Subject" name="subject_id" options={portal.subjects} />}</>}</Editor>}
  </div>;
}