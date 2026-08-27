import { Pressable, Text, View } from "react-native";
import { usePreferences } from "./preferences";

export function PreferencesControls() {
  const { colors, language, setLanguage, setThemePreference, themePreference, t } = usePreferences();
  return <View accessibilityLabel={t("preferences.label")} style={{ alignItems: "flex-end", gap: 6 }}>
    <View style={{ flexDirection: "row", gap: 8 }}>{(["tr", "en"] as const).map((nextLanguage) => <Pressable accessibilityLabel={t("preferences.language", { language: nextLanguage.toUpperCase() })} accessibilityRole="button" key={nextLanguage} onPress={() => void setLanguage(nextLanguage)} style={{ minHeight: 40, justifyContent: "center", opacity: language === nextLanguage ? 1 : 0.55 }}><Text style={{ color: colors.text }}>{nextLanguage.toUpperCase()}</Text></Pressable>)}</View>
    <View style={{ flexDirection: "row", gap: 8 }}>{(["light", "dark", "system"] as const).map((preference) => <Pressable accessibilityLabel={t(`preferences.theme.${preference}`)} accessibilityRole="button" key={preference} onPress={() => void setThemePreference(preference)} style={{ minHeight: 40, justifyContent: "center", opacity: themePreference === preference ? 1 : 0.55 }}><Text style={{ color: colors.text }}>{t(`preferences.themeShort.${preference}`)}</Text></Pressable>)}</View>
  </View>;
}
