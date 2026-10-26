import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/ui-kit";
import { StudentOverview } from "@/components/StudentOverview";
import { portalHead } from "@/lib/portal";

export const Route = createFileRoute("/_authenticated/students/$id")({
  head: () => portalHead("Student profile", "Detailed Class 10 student progress report."),
  component: StudentProfile,
});

function StudentProfile() {
  const { id } = Route.useParams();
  const p = useQuery({
    queryKey: ["profile", id],
    queryFn: async () => (await supabase.from("profiles").select("*").eq("id", id).maybeSingle()).data,
  });
  return (
    <div>
      <Link to="/students" className="no-print mb-3 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary"><ArrowLeft className="size-4" /> All students</Link>
      <PageHeader
        title={p.data?.full_name ?? "Student"}
        subtitle={[p.data?.student_code, p.data?.parent_name && `Parent: ${p.data.parent_name}`, p.data?.parent_phone].filter(Boolean).join(" · ")}
      />
      <StudentOverview studentId={id} showActions />
    </div>
  );
}
