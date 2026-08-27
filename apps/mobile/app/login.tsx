import { Redirect } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, SafeAreaView, StyleSheet, Text, TextInput, View } from "react-native";

import { useSession } from "../src/session";
import { PreferencesControls } from "../src/preferences-controls";
import { usePreferences } from "../src/preferences";

export default function LoginScreen() {
  const { apiUrl: savedApiUrl, isAuthenticated, saveApiUrl, signIn } = useSession();
  const { colors } = usePreferences();
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
      setError(reason instanceof Error ? reason.message : "Giri\u015f yap\u0131lamad\u0131.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const saveServer = async () => {
    setError(null);
    try {
      await saveApiUrl(apiUrl);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Sunucu adresi kaydedilemedi.");
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.container}>
        <View style={styles.preferences}><PreferencesControls /></View>
        <Text style={[styles.brand, { color: colors.text }]}>StokMate</Text>
        <Text style={[styles.subtitle, { color: colors.muted }]}>Stok y\u00f6netimine giri\u015f yap\u0131n</Text>
        <View style={styles.form}>
          <Text style={[styles.label, { color: colors.text }]}>API sunucu adresi</Text>
          <TextInput accessibilityLabel="API sunucu adresi" autoCapitalize="none" autoCorrect={false} keyboardType="url" onChangeText={setApiUrl} placeholder="http://10.0.2.2:5080" style={styles.input} value={apiUrl} />
          <Pressable accessibilityRole="button" onPress={() => void saveServer()} style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonText}>Adresi kaydet</Text>
          </Pressable>
          <Text style={styles.hint}>Android em\u00fclat\u00f6r\u00fc i\u00e7in: http://10.0.2.2:5080</Text>
          <Text style={[styles.label, { color: colors.text }]}>E-posta</Text>
          <TextInput accessibilityLabel="E-posta" autoCapitalize="none" autoCorrect={false} keyboardType="email-address" onChangeText={setEmail} style={styles.input} value={email} />
          <Text style={[styles.label, { color: colors.text }]}>\u015eifre</Text>
          <TextInput accessibilityLabel="\u015eifre" onChangeText={setPassword} secureTextEntry style={styles.input} value={password} />
          {error ? <Text accessibilityLiveRegion="polite" style={styles.error}>{error}</Text> : null}
          <Pressable accessibilityRole="button" disabled={isSubmitting} onPress={() => void submit()} style={[styles.primaryButton, isSubmitting && styles.disabledButton]}>
            {isSubmitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryButtonText}>Giri\u015f yap</Text>}
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: "#f8fafc", flex: 1 },
  container: { flex: 1, justifyContent: "center", padding: 24 },
  preferences: { position: "absolute", right: 24, top: 16 },
  brand: { color: "#0f172a", fontSize: 32, fontWeight: "700" },
  subtitle: { color: "#475569", fontSize: 16, marginTop: 6 },
  form: { marginTop: 32 },
  label: { color: "#1e293b", fontWeight: "600", marginBottom: 8, marginTop: 16 },
  input: { backgroundColor: "#fff", borderColor: "#cbd5e1", borderRadius: 8, borderWidth: 1, fontSize: 16, minHeight: 48, paddingHorizontal: 12 },
  hint: { color: "#64748b", fontSize: 12, lineHeight: 18, marginTop: 8 },
  primaryButton: { alignItems: "center", backgroundColor: "#0f766e", borderRadius: 8, marginTop: 24, minHeight: 48, justifyContent: "center" },
  primaryButtonText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  secondaryButton: { alignItems: "center", borderColor: "#0f766e", borderRadius: 8, borderWidth: 1, marginTop: 10, minHeight: 40, justifyContent: "center" },
  secondaryButtonText: { color: "#0f766e", fontWeight: "600" },
  disabledButton: { opacity: 0.6 },
  error: { color: "#b91c1c", lineHeight: 20, marginTop: 16 }
});
