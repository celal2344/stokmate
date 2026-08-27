import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { App } from "./app";
import { AuthProvider } from "./auth";
import { PreferencesProvider } from "./preferences";
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

createRoot(root).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <PreferencesProvider>
        <BrowserRouter>
          <AuthProvider>
            <App />
          </AuthProvider>
        </BrowserRouter>
      </PreferencesProvider>
    </QueryClientProvider>
  </StrictMode>,
);
