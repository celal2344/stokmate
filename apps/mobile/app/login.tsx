import { Redirect } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { PreferencesControls } from "../src/preferences-controls";
import { usePreferences } from "../src/preferences";
import { useSession } from "../src/session";

export default function LoginScreen() {
  const {
    apiUrl: savedApiUrl,
    isAuthenticated,
    saveApiUrl,
    signIn,
  } = useSession();
  const { colors, t } = usePreferences();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [apiUrl, setApiUrl] = useState(savedApiUrl);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (isAuthenticated) return <Redirect href="/" />;

  const submit = async () => {
    setError(null);
    setIsSubmitting(true);

    try {
      await signIn(email.trim(), password, apiUrl);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : t("login.failed"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const saveServer = async () => {
    setError(null);

    try {
      await saveApiUrl(apiUrl);
    } catch (reason) {
      setError(
        reason instanceof Error ? reason.message : t("login.saveApiUrlFailed"),
      );
    }
  };

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: colors.background }]}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.container}
      >
        <View style={styles.preferences}>
          <PreferencesControls />
        </View>
        <Text style={[styles.brand, { color: colors.text }]}>StokMate</Text>
        <Text style={[styles.subtitle, { color: colors.muted }]}>
          {t("login.subtitle")}
        </Text>
        <View style={styles.form}>
          <Text style={[styles.label, { color: colors.text }]}>
            {t("login.apiUrl")}
          </Text>
          <TextInput
            accessibilityLabel={t("login.apiUrl")}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="url"
            onChangeText={setApiUrl}
            placeholder="http://10.0.2.2:5080"
            placeholderTextColor={colors.muted}
            selectionColor={colors.primary}
            style={[
              styles.input,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
                color: colors.text,
              },
            ]}
            value={apiUrl}
          />
          <Pressable
            accessibilityLabel={t("login.saveApiUrl")}
            accessibilityRole="button"
            onPress={() => void saveServer()}
            style={[styles.secondaryButton, { borderColor: colors.primary }]}
          >
            <Text
              style={[styles.secondaryButtonText, { color: colors.primary }]}
            >
              {t("login.saveApiUrl")}
            </Text>
          </Pressable>
          <Text style={[styles.hint, { color: colors.muted }]}>
            {t("login.emulatorHint")}
          </Text>
          <Text style={[styles.label, { color: colors.text }]}>
            {t("login.email")}
          </Text>
          <TextInput
            accessibilityLabel={t("login.email")}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            onChangeText={setEmail}
            placeholderTextColor={colors.muted}
            selectionColor={colors.primary}
            style={[
              styles.input,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
                color: colors.text,
              },
            ]}
            value={email}
          />
          <Text style={[styles.label, { color: colors.text }]}>
            {t("login.password")}
          </Text>
          <TextInput
            accessibilityLabel={t("login.password")}
            onChangeText={setPassword}
            placeholderTextColor={colors.muted}
            secureTextEntry
            selectionColor={colors.primary}
            style={[
              styles.input,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
                color: colors.text,
              },
            ]}
            value={password}
          />
          {error ? (
            <Text
              accessibilityLiveRegion="polite"
              style={[styles.error, { color: colors.danger }]}
            >
              {error}
            </Text>
          ) : null}
          <Pressable
            accessibilityLabel={t("login.signIn")}
            accessibilityRole="button"
            disabled={isSubmitting}
            onPress={() => void submit()}
            style={[
              styles.primaryButton,
              { backgroundColor: colors.primary },
              isSubmitting && styles.disabledButton,
            ]}
          >
            {isSubmitting ? (
              <ActivityIndicator color={colors.primaryForeground} />
            ) : (
              <Text
                style={[
                  styles.primaryButtonText,
                  { color: colors.primaryForeground },
                ]}
              >
                {t("login.signIn")}
              </Text>
            )}
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: { flex: 1, justifyContent: "center", padding: 24 },
  preferences: { position: "absolute", right: 24, top: 16 },
  brand: { fontSize: 32, fontWeight: "700" },
  subtitle: { fontSize: 16, marginTop: 6 },
  form: { marginTop: 32 },
  label: { fontWeight: "600", marginBottom: 8, marginTop: 16 },
  input: {
    borderRadius: 8,
    borderWidth: 1,
    fontSize: 16,
    minHeight: 48,
    paddingHorizontal: 12,
  },
  hint: { fontSize: 12, lineHeight: 18, marginTop: 8 },
  primaryButton: {
    alignItems: "center",
    borderRadius: 8,
    justifyContent: "center",
    marginTop: 24,
    minHeight: 48,
  },
  primaryButtonText: { fontSize: 16, fontWeight: "700" },
  secondaryButton: {
    alignItems: "center",
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: "center",
    marginTop: 10,
    minHeight: 40,
  },
  secondaryButtonText: { fontWeight: "600" },
  disabledButton: { opacity: 0.6 },
  error: { lineHeight: 20, marginTop: 16 },
});
