import { createFileRoute } from "@tanstack/react-router";
import { DoubtsPortal } from "@/components/DoubtsPortal";
import { portalQuery, portalHead } from "@/lib/portal";

export const Route = createFileRoute("/_authenticated/doubts")({
  head: () => portalHead("Ask a Doubt", "Private student questions and teacher conversations."),
  loader: ({ context }) => context.queryClient.ensureQueryData(portalQuery),
  component: DoubtsPortal,
});
