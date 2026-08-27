import i18n from "i18next";
import * as SecureStore from "expo-secure-store";
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type PropsWithChildren } from "react";
import { useColorScheme } from "react-native";
import { defaultLanguage, fallbackLanguage, resources } from "@stokmate/i18n";

const LANGUAGE_KEY = "stokmate.language";
const THEME_KEY = "stokmate.theme";
type Language = "tr" | "en";
type ThemePreference = "light" | "dark" | "system";
type Theme = "light" | "dark";

type PreferencesValue = {
  colors: { background: string; border: string; card: string; muted: string; text: string };
  language: Language;
  setLanguage(language: Language): Promise<void>;
  theme: Theme;
  themePreference: ThemePreference;
  setThemePreference(preference: ThemePreference): Promise<void>;
  t(key: string, options?: Record<string, unknown>): string;
};

const PreferencesContext = createContext<PreferencesValue | null>(null);

void i18n.init({
  lng: defaultLanguage,
  fallbackLng: fallbackLanguage,
  defaultNS: "mobile",
  ns: ["mobile"],
  resources,
  interpolation: { escapeValue: false }
  ,keySeparator: false
});

export function PreferencesProvider({ children }: PropsWithChildren) {
  const systemTheme = useColorScheme();
  const [language, setLanguageState] = useState<Language>(defaultLanguage);
  const [themePreference, setThemePreferenceState] = useState<ThemePreference>("system");

  useEffect(() => {
    let active = true;
    void Promise.all([SecureStore.getItemAsync(LANGUAGE_KEY), SecureStore.getItemAsync(THEME_KEY)]).then(([savedLanguage, savedTheme]) => {
      if (!active) return;
      if (savedLanguage === "tr" || savedLanguage === "en") {
        setLanguageState(savedLanguage);
        void i18n.changeLanguage(savedLanguage);
      }
      if (savedTheme === "light" || savedTheme === "dark" || savedTheme === "system") setThemePreferenceState(savedTheme);
    });
    return () => { active = false; };
  }, []);

  const setLanguage = useCallback(async (nextLanguage: Language) => {
    await SecureStore.setItemAsync(LANGUAGE_KEY, nextLanguage);
    await i18n.changeLanguage(nextLanguage);
    setLanguageState(nextLanguage);
  }, []);
  const setThemePreference = useCallback(async (preference: ThemePreference) => {
    await SecureStore.setItemAsync(THEME_KEY, preference);
    setThemePreferenceState(preference);
  }, []);
  const theme: Theme = themePreference === "system" ? (systemTheme === "dark" ? "dark" : "light") : themePreference;
  const colors = theme === "dark"
    ? { background: "#0f172a", border: "#475569", card: "#1e293b", muted: "#cbd5e1", text: "#f8fafc" }
    : { background: "#f8fafc", border: "#cbd5e1", card: "#ffffff", muted: "#475569", text: "#0f172a" };
  const value = useMemo(() => ({ colors, language, setLanguage, theme, themePreference, setThemePreference, t: (key: string, options?: Record<string, unknown>) => i18n.t(key, options) }), [colors, language, setLanguage, setThemePreference, theme, themePreference]);
  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>;
}

export function usePreferences(): PreferencesValue {
  const context = useContext(PreferencesContext);
  if (!context) throw new Error("usePreferences must be used inside PreferencesProvider.");
  return context;
}
