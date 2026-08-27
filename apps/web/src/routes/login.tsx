import { createFileRoute, redirect } from "@tanstack/react-router";
import { z } from "zod";
import { LoginPage } from "../pages/login-page";

const loginSearch = z.object({
  redirect: z.string().startsWith("/").optional(),
});

export const Route = createFileRoute("/login")({
  validateSearch: (search) => loginSearch.parse(search),
  beforeLoad: async ({ context }) => {
    await context.auth.ensureRestored();
    if (context.auth.isAuthenticated)
      throw redirect({
        to: "/products",
        search: { q: "", sort: "name", dir: "asc", page: 1, pageSize: 20 },
      });
  },
  component: LoginRoute,
});

function LoginRoute() {
  return <LoginPage redirectTo={Route.useSearch().redirect} />;
}
