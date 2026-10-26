export const WORK_MIME = ["application/pdf", "image/jpeg", "image/png"];
export const DOCUMENT_MIME = [...WORK_MIME, "text/plain", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
export function validMark(mark: number, maximum: number) {
  return Number.isFinite(mark) && Number.isFinite(maximum) && maximum > 0 && mark >= 0 && mark <= maximum;
}
export function percentage(mark: number, maximum: number): number | null {
  return validMark(mark, maximum) ? Math.round(mark / maximum * 100) : null;
}
export function validateFile(file: { type: string; size: number }, documents = false, limit = 15 * 1024 * 1024) {
  if (!(documents ? DOCUMENT_MIME : WORK_MIME).includes(file.type)) throw new Error(documents ? "Choose a PDF, JPG, PNG, TXT or DOCX file." : "Choose a PDF, JPG/JPEG or PNG file.");
  if (file.size <= 0 || file.size > limit) throw new Error(`Each file must be non-empty and no larger than ${Math.floor(limit / 1024 / 1024)} MB.`);
}
export function safeExternalUrl(value: string) {
  const url = new URL(value);
  if (url.protocol !== "https:" && url.protocol !== "http:") throw new Error("Use an http or https link.");
  return url.href;
}