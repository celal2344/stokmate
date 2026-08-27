import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, SafeAreaView, StyleSheet, Text } from "react-native";

import { SessionProvider, useSession } from "../src/session";
import { PreferencesProvider } from "../src/preferences";

function AppNavigator() {
  const { isRestoring } = useSession();

  if (isRestoring) {
    return (
      <SafeAreaView style={styles.loading}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Oturum geri y\u00fckleniyor\u2026</Text>
      </SafeAreaView>
    );
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}

export default function RootLayout() {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { retry: 1, staleTime: 30_000 }
        }
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <PreferencesProvider>
        <SessionProvider>
          <AppNavigator />
        </SessionProvider>
      </PreferencesProvider>
    </QueryClientProvider>
  );
}

const styles = StyleSheet.create({
  loading: { alignItems: "center", flex: 1, justifyContent: "center", padding: 24 },
  loadingText: { color: "#475569", marginTop: 12 }
});
