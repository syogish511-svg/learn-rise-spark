import { supabase } from "@/integrations/supabase/client";
import { validateFile } from "./portal-validation";

export type StoredFile = { path: string; name: string };
export type PortalBucket = "submissions" | "resources" | "doubts" | "assignment-papers";
export function check(error: { message: string } | null) { if (error) throw new Error(error.message); }
export async function uploadPrivate(bucket: PortalBucket, file: File, onProgress: (n: number) => void): Promise<StoredFile> {
  validateFile(file, bucket === "resources" || bucket === "doubts", (bucket === "resources" ? 25 : bucket === "doubts" ? 10 : 15) * 1024 * 1024);
  const { data } = await supabase.auth.getSession();
  if (!data.session) throw new Error("Please sign in again.");
  const extension = file.name.split(".").at(-1)?.toLowerCase().replace(/[^a-z0-9]/g, "") || "file";
  const path = `${data.session.user.id}/${crypto.randomUUID()}.${extension}`;
  await new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/${bucket}/${path}`);
    xhr.setRequestHeader("Authorization", `Bearer ${data.session?.access_token}`);
    xhr.setRequestHeader("apikey", import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY);
    xhr.setRequestHeader("Content-Type", file.type);
    xhr.upload.onprogress = (e) => { if (e.lengthComputable) onProgress(Math.round(e.loaded / e.total * 100)); };
    xhr.onerror = () => reject(new Error("Upload interrupted. Check your connection and try again."));
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) { onProgress(100); resolve(); }
      else { let message = "Upload failed. Please check the file and try again."; try { const body = JSON.parse(xhr.responseText); message = body.message || body.error || message; } catch { /* preserve helpful default */ } reject(new Error(message)); }
    };
    xhr.send(file);
  });
  return { path, name: file.name };
}
export async function signedFile(bucket: PortalBucket, path: string, download = false) {
  const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, 300, { download });
  check(error);
  if (!data) throw new Error("This file is unavailable.");
  window.open(data.signedUrl, "_blank", "noopener,noreferrer");
}
export async function fetchPortal() {
  const [assignments, submissions, resources, doubts, replies, tests, marks, announcements, subjects] = await Promise.all([
    supabase.from("assignments").select("*").order("due_at"),
    supabase.from("submissions").select("*").order("submitted_at", {ascending:false}),
    supabase.from("resources").select("*").order("created_at", {ascending:false}),
    supabase.from("doubt_queries").select("*").order("created_at", {ascending:false}),
    supabase.from("doubt_replies").select("*").order("created_at"),
    supabase.from("tests").select("*").order("test_date", {ascending:false}),
    supabase.from("test_marks").select("*"),
    supabase.from("announcements").select("*").order("pinned", {ascending:false}).order("created_at", {ascending:false}),
    supabase.from("subjects").select("id,name,chapters(id,name)").order("name"),
  ]);
  for (const result of [assignments,submissions,resources,doubts,replies,tests,marks,announcements,subjects]) check(result.error);
  return { assignments:assignments.data??[],submissions:submissions.data??[],resources:resources.data??[],doubts:doubts.data??[],replies:replies.data??[],tests:tests.data??[],marks:marks.data??[],announcements:announcements.data??[],subjects:subjects.data??[] };
}
export const portalQuery = { queryKey: ["portal"], queryFn: fetchPortal };
export function portalHead(title: string, description: string) {
  return { meta: [{title:`${title} — SRSV Class 10 ICSE`},{name:"description",content:description},{property:"og:title",content:`${title} — SRSV Class 10 ICSE`},{property:"og:description",content:description},{property:"og:type",content:"website"},{name:"twitter:card",content:"summary"}] };
}