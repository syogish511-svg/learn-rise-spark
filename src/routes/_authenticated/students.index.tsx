import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";
import { UserPlus, Download, KeyRound, Power, Search, UserCog } from "lucide-react";
import { fetchClassBundle, studentSummary, downloadCsv } from "@/lib/data";
import { createStudent, createStaffOrParent, resetUserPassword, setStudentActive } from "@/lib/admin.functions";
import { useMe } from "@/lib/me";
import { PageHeader, Loading, ErrorNote, EngagementBadge, EmptyState } from "@/components/ui-kit";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const Route = createFileRoute("/_authenticated/students/")({
  head: () => ({ meta: [{ title: "Students — SRSV Class 10" }, { name: "description", content: "Manage Class 10 student accounts." }] }),
  component: StudentsPage,
});

function StudentsPage() {
  const qc = useQueryClient();
  const { data: me } = useMe();
  const q = useQuery({ queryKey: ["class-bundle"], queryFn: fetchClassBundle });
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [staffOpen, setStaffOpen] = useState(false);
  const create = useServerFn(createStudent);
  const createOther = useServerFn(createStaffOrParent);
  const reset = useServerFn(resetUserPassword);
  const setActive = useServerFn(setStudentActive);

  if (q.isLoading) return <Loading />;
  if (q.error) return <ErrorNote error={q.error} />;
  const b = q.data!;
  const rows = b.students
    .filter((s) => `${s.full_name} ${s.student_code}`.toLowerCase().includes(search.toLowerCase()))
    .map((s) => ({ s, ...studentSummary(b, s.id) }));
  const refresh = () => qc.invalidateQueries({ queryKey: ["class-bundle"] });

  async function onCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>;
    try {
      await create({ data: { studentCode: f.code, fullName: f.name, password: f.password, phone: f.phone, parentName: f.parentName, parentPhone: f.parentPhone } });
      toast.success(`Student ${f.code.toUpperCase()} created`);
      setOpen(false);
      refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not create student");
    }
  }
  async function onCreateOther(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>;
    try {
      await createOther({ data: { email: f.email, fullName: f.name, password: f.password, role: f.role as "teacher" | "parent", studentId: f.studentId || undefined } });
      toast.success("Account created");
      setStaffOpen(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not create account");
    }
  }
  async function onReset(id: string, name: string) {
    const pw = window.prompt(`New password for ${name} (min 8 characters):`);
    if (!pw) return;
    try {
      await reset({ data: { userId: id, password: pw } });
      toast.success("Password reset");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Reset failed");
    }
  }
  async function onToggle(id: string, active: boolean) {
    if (!window.confirm(active ? "Reactivate this student?" : "Deactivate this student? They will not be able to sign in.")) return;
    try {
      await setActive({ data: { userId: id, active } });
      toast.success(active ? "Student reactivated" : "Student deactivated");
      refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Update failed");
    }
  }

  return (
    <div>
      <PageHeader
        title="Students"
        subtitle={`${b.students.length} enrolled in Class 10`}
        actions={
          <>
            <Button variant="outline" onClick={() => downloadCsv("students.csv", [["Student ID", "Name", "Active", "Assigned", "Submitted", "Missing", "On-time %", "Avg test %", "Engagement"], ...rows.map((r) => [r.s.student_code, r.s.full_name, r.s.is_active ? "yes" : "no", r.stats.assigned, r.stats.submitted, r.stats.missing, r.stats.onTimePct, r.stats.avgTestPct, r.engagement.category])])}>
              <Download /> Export
            </Button>
            <Dialog open={staffOpen} onOpenChange={setStaffOpen}>
              <DialogTrigger asChild><Button variant="outline"><UserCog /> Teacher / parent</Button></DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Add teacher or parent account</DialogTitle></DialogHeader>
                <form onSubmit={onCreateOther} className="space-y-3">
                  <div className="space-y-1"><Label>Role</Label>
                    <Select name="role" defaultValue="parent">
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="parent">Parent</SelectItem>
                        {me?.isAdmin && <SelectItem value="teacher">Teacher</SelectItem>}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1"><Label>Full name</Label><Input name="name" required /></div>
                  <div className="space-y-1"><Label>Email</Label><Input name="email" type="email" required /></div>
                  <div className="space-y-1"><Label>Temporary password</Label><Input name="password" minLength={8} required /></div>
                  <div className="space-y-1"><Label>Link to student (parents)</Label>
                    <Select name="studentId">
                      <SelectTrigger><SelectValue placeholder="Choose student" /></SelectTrigger>
                      <SelectContent>{b.students.map((s) => <SelectItem key={s.id} value={s.id}>{s.full_name} ({s.student_code})</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <Button className="w-full">Create account</Button>
                </form>
              </DialogContent>
            </Dialog>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild><Button variant="gold"><UserPlus /> Add student</Button></DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Add a student</DialogTitle></DialogHeader>
                <form onSubmit={onCreate} className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1"><Label>Student ID</Label><Input name="code" required placeholder="SRSV10A01" /></div>
                  <div className="space-y-1"><Label>Full name</Label><Input name="name" required /></div>
                  <div className="space-y-1"><Label>Temporary password</Label><Input name="password" minLength={8} required /></div>
                  <div className="space-y-1"><Label>Student phone</Label><Input name="phone" /></div>
                  <div className="space-y-1"><Label>Parent name</Label><Input name="parentName" /></div>
                  <div className="space-y-1"><Label>Parent phone</Label><Input name="parentPhone" placeholder="+91…" /></div>
                  <Button className="sm:col-span-2">Create student</Button>
                </form>
              </DialogContent>
            </Dialog>
          </>
        }
      />
      <div className="relative mb-4 max-w-sm">
        <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
        <Input className="pl-9" placeholder="Search name or ID" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>
      {rows.length === 0 ? (
        <EmptyState title="No students yet" text="Add your first student to start tracking progress." />
      ) : (
        <div className="card-surface overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/60 text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr><th className="p-3">Student</th><th className="p-3">Submitted</th><th className="p-3">Missing</th><th className="p-3">On time</th><th className="p-3">Avg test</th><th className="p-3">Engagement</th><th className="p-3 text-right">Actions</th></tr>
            </thead>
            <tbody>
              {rows.map(({ s, stats, engagement }) => (
                <tr key={s.id} className="border-t hover:bg-muted/30">
                  <td className="p-3">
                    <Link to="/students/$id" params={{ id: s.id }} className="font-medium hover:text-primary">{s.full_name}</Link>
                    <p className="text-xs text-muted-foreground">{s.student_code}{!s.is_active && " · inactive"}</p>
                  </td>
                  <td className="p-3">{stats.submitted}/{stats.assigned}</td>
                  <td className="p-3">{stats.missing}</td>
                  <td className="p-3">{stats.onTimePct ?? "—"}{stats.onTimePct !== null && "%"}</td>
                  <td className="p-3">{stats.avgTestPct ?? "—"}{stats.avgTestPct !== null && "%"}</td>
                  <td className="p-3"><EngagementBadge category={engagement.category} /></td>
                  <td className="p-3 text-right whitespace-nowrap">
                    <Button size="icon" variant="ghost" title="Reset password" onClick={() => onReset(s.id, s.full_name)}><KeyRound /></Button>
                    <Button size="icon" variant="ghost" title={s.is_active ? "Deactivate" : "Reactivate"} onClick={() => onToggle(s.id, !s.is_active)}><Power className={s.is_active ? "" : "text-destructive"} /></Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
