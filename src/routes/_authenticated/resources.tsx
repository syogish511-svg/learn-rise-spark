import { createFileRoute } from "@tanstack/react-router";
import { ResourcesPortal } from "@/components/ResourcesPortal";
import { portalQuery, portalHead } from "@/lib/portal";

export const Route = createFileRoute("/_authenticated/resources")({
  head: () => portalHead("Resource Library", "Teacher-approved Class 10 learning resources."),
  loader: ({ context }) => context.queryClient.ensureQueryData(portalQuery),
  component: ResourcesPortal,
});
