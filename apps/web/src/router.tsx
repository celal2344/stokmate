import { createRouter } from "@tanstack/react-router";
import { browserAuth } from "./auth";
import { i18n } from "./i18n";
import { routeTree } from "./routeTree.gen";

export const router = createRouter({
  routeTree,
  context: { auth: browserAuth, queryClient: undefined! },
  defaultNotFoundComponent: () => (
    <main className="grid min-h-screen place-items-center p-6">
      <h1 className="text-xl font-semibold tracking-tight">
        {i18n.t("pageNotFound")}
      </h1>
    </main>
  ),
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
