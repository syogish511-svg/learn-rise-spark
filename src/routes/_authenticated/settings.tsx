import { createFileRoute } from "@tanstack/react-router";
import { SettingsPortal, settingsQuery } from "@/components/SettingsPortal";
import { portalHead, portalQuery } from "@/lib/portal";

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => portalHead("Settings", "School examination countdown, curriculum and activity audit."),
  loader: async ({ context }) => {
    await Promise.all([context.queryClient.ensureQueryData(settingsQuery), context.queryClient.ensureQueryData(portalQuery)]);
  },
  component: SettingsPortal,
});