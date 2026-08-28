import {
  CameraView,
  useCameraPermissions,
  type BarcodeScanningResult,
} from "expo-camera";
import { router } from "expo-router";
import { useCallback, useRef, useState } from "react";
import {
  ActivityIndicator,
  Linking,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { getProducts, type ApiClient } from "@stokmate/api-client";

import { usePreferences } from "../../src/preferences";

type ScannerResult = "noMatch" | "ambiguous" | "failed" | null;

export function BarcodeScanner({
  apiClient,
  onClose,
  visible,
}: {
  apiClient: ApiClient;
  onClose(): void;
  visible: boolean;
}) {
  const { bottom, top } = useSafeAreaInsets();
  const { colors, t } = usePreferences();
  const [permission, requestPermission] = useCameraPermissions();
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [result, setResult] = useState<ScannerResult>(null);
  const scanLocked = useRef(false);

  const close = useCallback(() => {
    scanLocked.current = false;
    setIsLookingUp(false);
    setResult(null);
    onClose();
  }, [onClose]);

  const retry = useCallback(() => {
    scanLocked.current = false;
    setResult(null);
  }, []);

  const onBarcodeScanned = useCallback(
    async ({ data }: BarcodeScanningResult) => {
      const barcode = data.trim();
      if (!barcode || scanLocked.current) return;

      scanLocked.current = true;
      setIsLookingUp(true);
      setResult(null);

      try {
        const response = await getProducts(
          { Q: barcode, Page: 1, PageSize: 100 },
          undefined,
          apiClient.fetch,
        );
        const matches = (response.data.items ?? []).filter(
          (product) => product.barcode === barcode,
        );

        if (matches.length === 1 && matches[0]?.id != null) {
          close();
          router.push({
            pathname: "/products/[id]",
            params: { id: String(matches[0].id) },
          });
          return;
        }

        setResult(matches.length === 0 ? "noMatch" : "ambiguous");
      } catch {
        setResult("failed");
      } finally {
        setIsLookingUp(false);
      }
    },
    [apiClient.fetch, close],
  );

  const denied = permission !== null && !permission.granted;

  return (
    <Modal animationType="slide" onRequestClose={close} visible={visible}>
      <View style={[styles.screen, { backgroundColor: colors.background }]}>
        <View
          style={[
            styles.header,
            {
              backgroundColor: colors.card,
              borderBottomColor: colors.border,
              paddingTop: Math.max(top, 16),
            },
          ]}
        >
          <Text
            accessibilityRole="header"
            style={[styles.title, { color: colors.text }]}
          >
            {t("scanner.title")}
          </Text>
          <Pressable
            accessibilityLabel={t("scanner.close")}
            accessibilityRole="button"
            hitSlop={8}
            onPress={close}
            style={styles.close}
          >
            <Text style={{ color: colors.primary, fontWeight: "700" }}>
              {t("scanner.close")}
            </Text>
          </Pressable>
        </View>
        {!permission || denied ? (
          <View style={styles.permission}>
            <Text
              accessibilityRole="header"
              style={[styles.permissionTitle, { color: colors.text }]}
            >
              {t("scanner.permissionTitle")}
            </Text>
            <Text style={[styles.description, { color: colors.muted }]}>
              {t("scanner.permissionDescription")}
            </Text>
            {permission?.canAskAgain === false ? (
              <Pressable
                accessibilityRole="button"
                onPress={() => void Linking.openSettings()}
                style={[styles.button, { backgroundColor: colors.primary }]}
              >
                <Text
                  style={{ color: colors.primaryForeground, fontWeight: "700" }}
                >
                  {t("scanner.openSettings")}
                </Text>
              </Pressable>
            ) : (
              <Pressable
                accessibilityRole="button"
                onPress={() => void requestPermission()}
                style={[styles.button, { backgroundColor: colors.primary }]}
              >
                <Text
                  style={{ color: colors.primaryForeground, fontWeight: "700" }}
                >
                  {t("scanner.request")}
                </Text>
              </Pressable>
            )}
          </View>
        ) : (
          <View style={styles.cameraArea}>
            <CameraView
              barcodeScannerSettings={{
                barcodeTypes: [
                  "ean13",
                  "ean8",
                  "code128",
                  "code39",
                  "upc_a",
                  "upc_e",
                  "qr",
                ],
              }}
              onBarcodeScanned={
                isLookingUp || result ? undefined : onBarcodeScanned
              }
              style={StyleSheet.absoluteFillObject}
            />
            <View pointerEvents="none" style={styles.frame} />
            <Text style={styles.instructions}>
              {isLookingUp ? t("scanner.scanning") : t("scanner.instructions")}
            </Text>
            {isLookingUp ? (
              <ActivityIndicator
                color="#ffffff"
                size="large"
                style={styles.loading}
              />
            ) : null}
            {result ? (
              <View
                style={[
                  styles.result,
                  {
                    backgroundColor: colors.warningSurface,
                    borderColor: colors.warning,
                    bottom: bottom + 20,
                  },
                ]}
              >
                <Text
                  accessibilityLiveRegion="polite"
                  style={[styles.resultText, { color: colors.warning }]}
                >
                  {t(`scanner.${result}`)}
                </Text>
                <Pressable
                  accessibilityRole="button"
                  onPress={retry}
                  style={[styles.button, { backgroundColor: colors.primary }]}
                >
                  <Text
                    style={{
                      color: colors.primaryForeground,
                      fontWeight: "700",
                    }}
                  >
                    {t("scanner.retry")}
                  </Text>
                </Pressable>
              </View>
            ) : null}
          </View>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: {
    alignItems: "center",
    borderBottomWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  title: { fontSize: 20, fontWeight: "700" },
  close: { justifyContent: "center", minHeight: 44, paddingHorizontal: 10 },
  cameraArea: { backgroundColor: "#020617", flex: 1, justifyContent: "center" },
  frame: {
    alignSelf: "center",
    borderColor: "#ffffff",
    borderRadius: 12,
    borderWidth: 2,
    height: 210,
    width: "82%",
  },
  instructions: {
    bottom: 72,
    color: "#ffffff",
    left: 24,
    position: "absolute",
    right: 24,
    textAlign: "center",
  },
  loading: { alignSelf: "center", bottom: 108, position: "absolute" },
  permission: {
    alignItems: "center",
    flex: 1,
    gap: 16,
    justifyContent: "center",
    padding: 24,
  },
  permissionTitle: { fontSize: 20, fontWeight: "700", textAlign: "center" },
  description: { lineHeight: 22, textAlign: "center" },
  button: {
    alignItems: "center",
    borderRadius: 8,
    justifyContent: "center",
    minHeight: 48,
    paddingHorizontal: 18,
  },
  result: {
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
    left: 20,
    padding: 16,
    position: "absolute",
    right: 20,
  },
  resultText: { textAlign: "center" },
});
