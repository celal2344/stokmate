import { StrictMode, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "@tanstack/react-router";
import { AuthProvider, useAuth } from "./auth";
import { PreferencesProvider } from "./preferences";
import { router } from "./router";
import "./i18n";
import "./styles.css";

const root = document.getElementById("root");

if (!root) {
  throw new Error("StokMate root element is missing.");
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: true,
    },
  },
});

function UnauthorizedRedirect() {
  const { isAuthenticated, isRestoring } = useAuth();
  useEffect(() => {
    if (
      !isRestoring &&
      !isAuthenticated &&
      router.state.location.pathname !== "/login"
    ) {
      void router.navigate({
        to: "/login",
        search: { redirect: router.state.location.href },
        replace: true,
      });
    }
  }, [isAuthenticated, isRestoring]);
  return null;
}

createRoot(root).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <PreferencesProvider>
        <AuthProvider>
          <UnauthorizedRedirect />
          <RouterProvider router={router} context={{ queryClient }} />
        </AuthProvider>
      </PreferencesProvider>
    </QueryClientProvider>
  </StrictMode>,
);
