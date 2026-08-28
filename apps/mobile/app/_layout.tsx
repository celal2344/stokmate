import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as NavigationBar from "expo-navigation-bar";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  SafeAreaView,
  StyleSheet,
  Text,
} from "react-native";
import { StatusBar } from "expo-status-bar";

import { PreferencesProvider, usePreferences } from "../src/preferences";
import { SessionProvider, useSession } from "../src/session";

function AppNavigator() {
  const { colors, t, theme } = usePreferences();
  const { isRestoring } = useSession();

  useEffect(() => {
    void NavigationBar.setButtonStyleAsync(
      theme === "dark" ? "light" : "dark",
    ).catch(() => undefined);
  }, [theme]);

  if (isRestoring) {
    return (
      <SafeAreaView
        style={[styles.loading, { backgroundColor: colors.background }]}
      >
        <StatusBar style={theme === "dark" ? "light" : "dark"} />
        <ActivityIndicator color={colors.primary} size="large" />
        <Text style={[styles.loadingText, { color: colors.muted }]}>
          {t("session.restoring")}
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <>
      <StatusBar style={theme === "dark" ? "light" : "dark"} />
      <Stack
        screenOptions={{
          contentStyle: { backgroundColor: colors.background },
          headerShown: false,
        }}
      />
    </>
  );
}

export default function RootLayout() {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { retry: 1, staleTime: 30_000 },
        },
      }),
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
  loading: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    padding: 24,
  },
  loadingText: { marginTop: 12 },
});
