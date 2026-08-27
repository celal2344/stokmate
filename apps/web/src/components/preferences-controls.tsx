import { useTranslation } from "react-i18next";
import { usePreferences } from "../preferences";

export function PreferencesControls() {
  const { i18n, t } = useTranslation();
  const { theme, setTheme } = usePreferences();
  return (
    <div className="flex gap-2">
      <label className="text-xs font-medium">
        {t("language")}
        <select
          className="ml-1 rounded border bg-background px-1 py-0.5"
          value={i18n.language}
          onChange={(event) => void i18n.changeLanguage(event.target.value)}
        >
          <option value="tr">{t("turkish")}</option>
          <option value="en">{t("english")}</option>
        </select>
      </label>
      <label className="text-xs font-medium">
        {t("theme")}
        <select
          className="ml-1 rounded border bg-background px-1 py-0.5"
          value={theme}
          onChange={(event) =>
            setTheme(event.target.value as "light" | "dark" | "system")
          }
        >
          <option value="light">{t("light")}</option>
          <option value="dark">{t("dark")}</option>
          <option value="system">{t("system")}</option>
        </select>
      </label>
    </div>
  );
}
