import { useTranslation } from "react-i18next";
import { usePreferences } from "../preferences";
import { useProductEventsConnectionState } from "../product-events";
import { Select } from "./ui/select";

export function PreferencesControls() {
  const { i18n, t } = useTranslation();
  const { theme, setTheme } = usePreferences();
  const connectionState = useProductEventsConnectionState();
  const connectionKey =
    connectionState === "connected"
      ? "realtimeConnected"
      : connectionState === "reconnecting"
        ? "realtimeReconnecting"
        : "realtimeDisconnected";
  return (
    <div className="flex flex-wrap items-end gap-2">
      <span
        className="mb-1 inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground"
        role="status"
        aria-live="polite"
      >
        <span
          aria-hidden="true"
          className={
            connectionState === "connected"
              ? "size-1.5 rounded-full bg-primary"
              : connectionState === "reconnecting"
                ? "size-1.5 rounded-full bg-amber-500"
                : "size-1.5 rounded-full bg-muted-foreground"
          }
        />
        {t(connectionKey)}
      </span>
      <label className="grid gap-1 text-xs font-medium text-muted-foreground">
        <span>{t("language")}</span>
        <Select
          className="h-8 min-w-24 px-2 text-xs text-foreground"
          value={i18n.language}
          onChange={(event) => void i18n.changeLanguage(event.target.value)}
        >
          <option value="tr">{t("turkish")}</option>
          <option value="en">{t("english")}</option>
        </Select>
      </label>
      <label className="grid gap-1 text-xs font-medium text-muted-foreground">
        <span>{t("theme")}</span>
        <Select
          className="h-8 min-w-24 px-2 text-xs text-foreground"
          value={theme}
          onChange={(event) =>
            setTheme(event.target.value as "light" | "dark" | "system")
          }
        >
          <option value="light">{t("light")}</option>
          <option value="dark">{t("dark")}</option>
          <option value="system">{t("system")}</option>
        </Select>
      </label>
    </div>
  );
}
