import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

type Theme = "light" | "dark" | "system";
type Preferences = { theme: Theme; setTheme(theme: Theme): void };
const PreferencesContext = createContext<Preferences | undefined>(undefined);

function resolvedTheme(theme: Theme) {
  return theme === "system" ? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light") : theme;
}

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    const value = window.localStorage.getItem("stokmate.web.theme");
    return value === "light" || value === "dark" || value === "system" ? value : "system";
  });
  useEffect(() => {
    const apply = () => { document.documentElement.dataset.theme = resolvedTheme(theme); };
    apply();
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, [theme]);
  const value = useMemo(() => ({ theme, setTheme(next: Theme) { window.localStorage.setItem("stokmate.web.theme", next); setThemeState(next); } }), [theme]);
  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>;
}

export function usePreferences() {
  const context = useContext(PreferencesContext);
  if (!context) throw new Error("usePreferences must be used within PreferencesProvider.");
  return context;
}
