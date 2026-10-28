import { createFileRoute } from "@tanstack/react-router";
import { AnnouncementsPortal } from "@/components/AnnouncementsPortal";
import { portalQuery, portalHead } from "@/lib/portal";

export const Route = createFileRoute("/_authenticated/announcements")({
  head: () => portalHead("Announcements", "School announcements for Class 10 ICSE."),
  loader: ({ context }) => context.queryClient.ensureQueryData(portalQuery),
  component: AnnouncementsPortal,
});
