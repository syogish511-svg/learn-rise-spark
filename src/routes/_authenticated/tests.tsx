import { createFileRoute } from "@tanstack/react-router";
import { TestsPortal } from "@/components/TestsPortal";
import { portalQuery, portalHead } from "@/lib/portal";

export const Route = createFileRoute("/_authenticated/tests")({
  head: () => portalHead("Tests & Marks", "Class 10 test results and teacher feedback."),
  loader: ({ context }) => context.queryClient.ensureQueryData(portalQuery),
  component: TestsPortal,
});
