import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";

import { type ThemePreference, usePreferences } from "./preferences";

const nextTheme: Record<ThemePreference, ThemePreference> = {
  light: "dark",
  dark: "system",
  system: "light",
};

const themeIcons: Record<ThemePreference, keyof typeof Ionicons.glyphMap> = {
  light: "sunny-outline",
  dark: "moon-outline",
  system: "phone-portrait-outline",
};

export function PreferencesControls() {
  const {
    colors,
    language,
    setLanguage,
    setThemePreference,
    t,
    themePreference,
  } = usePreferences();
  const upcomingTheme = nextTheme[themePreference];

  return (
    <View accessibilityLabel={t("preferences.label")} style={{ gap: 8 }}>
      <View style={{ flexDirection: "row", gap: 6 }}>
        {(["tr", "en"] as const).map((nextLanguage) => {
          const selected = language === nextLanguage;
          return (
            <Pressable
              accessibilityLabel={t("preferences.language", {
                language: t(`preferences.languageName.${nextLanguage}`),
              })}
              accessibilityRole="button"
              key={nextLanguage}
              onPress={() => void setLanguage(nextLanguage)}
              style={{
                alignItems: "center",
                backgroundColor: selected ? colors.subtle : "transparent",
                borderColor: colors.border,
                borderRadius: 8,
                borderWidth: 1,
                justifyContent: "center",
                minHeight: 40,
                paddingHorizontal: 10,
              }}
            >
              <Text style={{ color: colors.text, fontWeight: "600" }}>
                {t(`preferences.languageName.${nextLanguage}`)}
              </Text>
            </Pressable>
          );
        })}
        <Pressable
          accessibilityHint={t("preferences.themeToggleHint", {
            next: t(`preferences.themeShort.${upcomingTheme}`),
          })}
          accessibilityLabel={t("preferences.themeToggle", {
            current: t(`preferences.themeShort.${themePreference}`),
            next: t(`preferences.themeShort.${upcomingTheme}`),
          })}
          accessibilityRole="button"
          hitSlop={6}
          onPress={() => void setThemePreference(upcomingTheme)}
          style={{
            alignItems: "center",
            backgroundColor: colors.subtle,
            borderColor: colors.border,
            borderRadius: 8,
            borderWidth: 1,
            justifyContent: "center",
            minHeight: 40,
            minWidth: 40,
          }}
        >
          <Ionicons
            color={colors.text}
            name={themeIcons[themePreference]}
            size={20}
          />
        </Pressable>
      </View>
    </View>
  );
}
