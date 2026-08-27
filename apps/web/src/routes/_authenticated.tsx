import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated")({
  beforeLoad: async ({ context, location }) => {
    await context.auth.ensureRestored();
    if (!context.auth.isAuthenticated)
      throw redirect({ to: "/login", search: { redirect: location.href } });
  },
  component: Outlet,
});
