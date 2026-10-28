import { createFileRoute } from "@tanstack/react-router";
import { AssignmentsPortal } from "@/components/AssignmentsPortal";
import { portalQuery, portalHead } from "@/lib/portal";

export const Route = createFileRoute("/_authenticated/assignments")({
  head: () => portalHead("Assignments", "Class 10 daily work, private submissions and teacher reviews."),
  loader: ({ context }) => context.queryClient.ensureQueryData(portalQuery),
  component: AssignmentsPortal,
});
