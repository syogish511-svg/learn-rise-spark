import { useState, type ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { fetchPortal } from "@/lib/portal";

export type PortalData = Awaited<ReturnType<typeof fetchPortal>>;
export function Field({label, name, value, type="text", required=false, min, max, step}: {label:string;name:string;value?:string|number|null;type?:string;required?:boolean;min?:number;max?:number;step?:string}) {
  return <div className="space-y-1.5"><Label htmlFor={name}>{label}</Label><Input id={name} name={name} type={type} defaultValue={value??""} required={required} min={min} max={max} step={step}/></div>;
}
export function LongField({label,name,value,required=false}: {label:string;name:string;value?:string|null;required?:boolean}) { return <div className="space-y-1.5"><Label htmlFor={name}>{label}</Label><Textarea id={name} name={name} defaultValue={value??""} required={required} rows={4}/></div>; }
export function Choice({label,name,value="",options,onValueChange}: {label:string;name:string;value?:string|null;options:{id:string;name:string}[];onValueChange?:(value:string)=>void}) {return <div className="space-y-1.5"><Label htmlFor={name}>{label}</Label><Select name={name} defaultValue={value||"none"} onValueChange={onValueChange}><SelectTrigger id={name}><SelectValue/></SelectTrigger><SelectContent><SelectItem value="none">—</SelectItem>{options.map(o=><SelectItem value={o.id} key={o.id}>{o.name}</SelectItem>)}</SelectContent></Select></div>;}
export function Curriculum({data, subject, chapter}: {data:PortalData;subject?:string|null;chapter?:string|null}) {
  const [selected,setSelected] = useState(subject||"");
  return <div className="grid gap-3 sm:grid-cols-2"><div className="space-y-1.5"><Label>Subject</Label><Select name="subject_id" value={selected||"none"} onValueChange={v=>setSelected(v==="none"?"":v)}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent><SelectItem value="none">—</SelectItem>{data.subjects.map(s=><SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent></Select></div><Choice key={selected} label="Chapter" name="chapter_id" value={chapter} options={data.subjects.find(s=>s.id===selected)?.chapters??[]}/></div>;
}
export function nullable(value: FormDataEntryValue|null) { return value && value!=="none" ? String(value) : null; }
export function FilesField({multiple=false,documents=false}: {multiple?:boolean;documents?:boolean}) {return <div className="space-y-1.5"><Label htmlFor="files">Attachment{multiple?"s":""}</Label><Input id="files" name="files" type="file" multiple={multiple} accept={documents?".pdf,.jpg,.jpeg,.png,.txt,.docx":".pdf,.jpg,.jpeg,.png"}/></div>;}
export function pickedFiles(f:FormData) { return f.getAll("files").filter((v):v is File=>v instanceof File && v.size>0); }
export function Editor({title,open,onClose,onSave,children}: {title:string;open:boolean;onClose:()=>void;onSave:(f:FormData,progress:(n:number)=>void)=>Promise<void>;children:ReactNode}) {
  const [busy,setBusy]=useState(false); const [progress,setProgress]=useState<number|null>(null); const [error,setError]=useState(""); const qc=useQueryClient();
  async function submit(e:React.FormEvent<HTMLFormElement>) {e.preventDefault();setBusy(true);setError("");setProgress(null);try {await onSave(new FormData(e.currentTarget),setProgress);await qc.invalidateQueries();toast.success("Saved successfully");onClose();}catch(err){setError(err instanceof Error?err.message:"Could not save. Please try again.");}finally{setBusy(false);}}
  return <Dialog open={open} onOpenChange={v=>{if(!busy&&!v)onClose();}}><DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl"><DialogHeader><DialogTitle>{title}</DialogTitle></DialogHeader><form className="space-y-4" onSubmit={submit}>{children}{progress!==null&&<div><progress aria-label="Upload progress" className="w-full" value={progress} max={100}/><p className="text-xs text-muted-foreground">Uploading: {progress}%</p></div>}{error&&<p role="alert" className="text-sm text-destructive">{error}</p>}<Button className="w-full" disabled={busy}>{busy?"Saving…":"Save"}</Button></form></DialogContent></Dialog>;
}
export function PublishField({published=true}: {published?:boolean}) {return <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="published" defaultChecked={published}/> Published</label>;}
export function FileActions({onOpen,onDownload,name}: {onOpen:()=>void;onDownload?:()=>void;name:string}) {return <div className="flex flex-wrap items-center gap-2"><Button type="button" size="sm" variant="outline" onClick={onOpen}>Open {name}</Button>{onDownload&&<Button type="button" size="sm" variant="ghost" onClick={onDownload}>Download</Button>}</div>;}
export async function action(task:()=>Promise<void>,success="Updated successfully") {try{await task();toast.success(success);}catch(e){toast.error(e instanceof Error?e.message:"The action failed.");}}