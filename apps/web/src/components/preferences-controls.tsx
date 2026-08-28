import { useTranslation } from "react-i18next";
import { Monitor, Moon, Sun } from "lucide-react";
import { usePreferences } from "../preferences";
import { useProductEventsConnectionState } from "../product-events";
import { Select } from "./ui/select";

const nextTheme = {
  light: "dark",
  dark: "system",
  system: "light",
} as const;

export function PreferencesControls({
  showConnectionState = true,
}: {
  showConnectionState?: boolean;
}) {
  const { i18n, t } = useTranslation();
  const { theme, setTheme } = usePreferences();
  const upcomingTheme = nextTheme[theme];
  const ThemeIcon = theme === "light" ? Sun : theme === "dark" ? Moon : Monitor;
  const connectionState = useProductEventsConnectionState();
  const connectionKey =
    connectionState === "connected"
      ? "realtimeConnected"
      : connectionState === "reconnecting"
        ? "realtimeReconnecting"
        : "realtimeDisconnected";
  return (
    <div className="flex flex-wrap items-end gap-2">
      {showConnectionState ? (
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
      ) : null}
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
      <button
        aria-label={t("themeToggle", {
          current: t(theme),
          next: t(upcomingTheme),
        })}
        className="inline-flex size-10 items-center justify-center self-end rounded-md border border-input bg-background text-foreground transition-colors hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        title={t("themeToggle", {
          current: t(theme),
          next: t(upcomingTheme),
        })}
        type="button"
        onClick={() => setTheme(upcomingTheme)}
      >
        <ThemeIcon aria-hidden="true" className="size-4" />
      </button>
    </div>
  );
}
