import { defaultLanguage, fallbackLanguage, resources } from "@stokmate/i18n";
import i18n from "i18next";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from "react";
import { useColorScheme } from "react-native";
import { appStorage } from "./storage";

const LANGUAGE_KEY = "stokmate.language";
const THEME_KEY = "stokmate.theme";

export type Language = "tr" | "en";
export type ThemePreference = "light" | "dark" | "system";
export type Theme = "light" | "dark";

export type MobileColors = {
  background: string;
  border: string;
  card: string;
  danger: string;
  dangerSurface: string;
  muted: string;
  overlay: string;
  primary: string;
  primaryForeground: string;
  subtle: string;
  text: string;
  warning: string;
  warningSurface: string;
};

type PreferencesValue = {
  colors: MobileColors;
  language: Language;
  setLanguage(language: Language): Promise<void>;
  theme: Theme;
  themePreference: ThemePreference;
  setThemePreference(preference: ThemePreference): Promise<void>;
  t(key: string, options?: Record<string, unknown>): string;
};

const PreferencesContext = createContext<PreferencesValue | null>(null);

const lightColors: MobileColors = {
  background: "#f8fafc",
  border: "#cbd5e1",
  card: "#ffffff",
  danger: "#b91c1c",
  dangerSurface: "#fef2f2",
  muted: "#475569",
  overlay: "rgba(15, 23, 42, 0.56)",
  primary: "#0f766e",
  primaryForeground: "#ffffff",
  subtle: "#f1f5f9",
  text: "#0f172a",
  warning: "#92400e",
  warningSurface: "#fffbeb",
};

const darkColors: MobileColors = {
  background: "#0f172a",
  border: "#475569",
  card: "#1e293b",
  danger: "#fca5a5",
  dangerSurface: "#450a0a",
  muted: "#cbd5e1",
  overlay: "rgba(2, 6, 23, 0.76)",
  primary: "#5eead4",
  primaryForeground: "#042f2e",
  subtle: "#243248",
  text: "#f8fafc",
  warning: "#fcd34d",
  warningSurface: "#422006",
};

void i18n.init({
  lng: defaultLanguage,
  fallbackLng: fallbackLanguage,
  defaultNS: "mobile",
  interpolation: { escapeValue: false },
  keySeparator: false,
  ns: ["mobile"],
  resources,
});

export function PreferencesProvider({ children }: PropsWithChildren) {
  const systemTheme = useColorScheme();
  const [language, setLanguageState] = useState<Language>(defaultLanguage);
  const [themePreference, setThemePreferenceState] =
    useState<ThemePreference>("system");

  useEffect(() => {
    let active = true;
    void Promise.all([
      appStorage.getItem(LANGUAGE_KEY),
      appStorage.getItem(THEME_KEY),
    ]).then(([savedLanguage, savedTheme]) => {
      if (!active) return;

      if (savedLanguage === "tr" || savedLanguage === "en") {
        setLanguageState(savedLanguage);
        void i18n.changeLanguage(savedLanguage);
      }

      if (
        savedTheme === "light" ||
        savedTheme === "dark" ||
        savedTheme === "system"
      ) {
        setThemePreferenceState(savedTheme);
      }
    });

    return () => {
      active = false;
    };
  }, []);

  const setLanguage = useCallback(async (nextLanguage: Language) => {
    await appStorage.setItem(LANGUAGE_KEY, nextLanguage);
    await i18n.changeLanguage(nextLanguage);
    setLanguageState(nextLanguage);
  }, []);

  const setThemePreference = useCallback(
    async (preference: ThemePreference) => {
      await appStorage.setItem(THEME_KEY, preference);
      setThemePreferenceState(preference);
    },
    [],
  );

  const theme: Theme =
    themePreference === "system"
      ? systemTheme === "dark"
        ? "dark"
        : "light"
      : themePreference;
  const colors = theme === "dark" ? darkColors : lightColors;

  const value = useMemo(
    () => ({
      colors,
      language,
      setLanguage,
      setThemePreference,
      t: (key: string, options?: Record<string, unknown>) =>
        i18n.t(key, options),
      theme,
      themePreference,
    }),
    [colors, language, setLanguage, setThemePreference, theme, themePreference],
  );

  return (
    <PreferencesContext.Provider value={value}>
      {children}
    </PreferencesContext.Provider>
  );
}

export function usePreferences(): PreferencesValue {
  const context = useContext(PreferencesContext);
  if (!context) {
    throw new Error("usePreferences must be used inside PreferencesProvider.");
  }

  return context;
}
