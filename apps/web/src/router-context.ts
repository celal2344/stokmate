import type { QueryClient } from "@tanstack/react-query";
import type { AuthContextValue } from "./auth";

export interface RouterContext {
  auth: Pick<
    AuthContextValue,
    "apiClient" | "isAuthenticated" | "isRestoring" | "login" | "logout"
  > & { ensureRestored(): Promise<void> };
  queryClient: QueryClient;
}
