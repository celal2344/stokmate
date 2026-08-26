import { Redirect } from "expo-router";
import { useState } from "react";
import { Pressable, SafeAreaView, StyleSheet, Text, TextInput, View } from "react-native";

import { useSession } from "../src/session";

export default function HomeScreen() {
  const { apiUrl: savedApiUrl, isAuthenticated, saveApiUrl, signOut } = useSession();
  const [apiUrl, setApiUrl] = useState(savedApiUrl);
  const [serverError, setServerError] = useState<string | null>(null);

  if (!isAuthenticated) return <Redirect href="/login" />;

  const saveServer = async () => {
    setServerError(null);
    try {
      await saveApiUrl(apiUrl);
    } catch (reason) {
      setServerError(reason instanceof Error ? reason.message : "Sunucu adresi kaydedilemedi.");
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>StokMate</Text>
        <Text style={styles.message}>Oturumunuz a\u00e7\u0131k.</Text>
        <Text style={styles.label}>API sunucu adresi</Text>
        <TextInput accessibilityLabel="API sunucu adresi" autoCapitalize="none" autoCorrect={false} keyboardType="url" onChangeText={setApiUrl} style={styles.input} value={apiUrl} />
        <Pressable accessibilityRole="button" onPress={() => void saveServer()} style={styles.secondaryButton}>
          <Text style={styles.secondaryButtonText}>Adresi kaydet</Text>
        </Pressable>
        {serverError ? <Text accessibilityLiveRegion="polite" style={styles.error}>{serverError}</Text> : null}
        <Text style={styles.note}>\u00dcr\u00fcn listesi bir sonraki mobil kap\u0131da eklenecek.</Text>
        <Pressable accessibilityRole="button" onPress={() => void signOut()} style={styles.button}>
          <Text style={styles.buttonText}>\u00c7\u0131k\u0131\u015f yap</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: "#f8fafc", flex: 1 },
  container: { flex: 1, padding: 24 },
  title: { color: "#0f172a", fontSize: 28, fontWeight: "700", marginTop: 24 },
  message: { color: "#334155", fontSize: 17, marginTop: 12 },
  label: { color: "#1e293b", fontWeight: "600", marginBottom: 8, marginTop: 24 },
  input: { backgroundColor: "#fff", borderColor: "#cbd5e1", borderRadius: 8, borderWidth: 1, fontSize: 16, minHeight: 48, paddingHorizontal: 12 },
  secondaryButton: { alignItems: "center", borderColor: "#0f766e", borderRadius: 8, borderWidth: 1, marginTop: 10, minHeight: 40, justifyContent: "center" },
  secondaryButtonText: { color: "#0f766e", fontWeight: "600" },
  error: { color: "#b91c1c", lineHeight: 20, marginTop: 10 },
  note: { color: "#64748b", lineHeight: 20, marginTop: 28 },
  button: { alignItems: "center", backgroundColor: "#0f766e", borderRadius: 8, marginTop: 32, minHeight: 48, justifyContent: "center" },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "700" }
});
