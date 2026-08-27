import { CameraView, useCameraPermissions, type BarcodeScanningResult } from "expo-camera";
import { router } from "expo-router";
import { useCallback, useRef, useState } from "react";
import { ActivityIndicator, Linking, Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { getProducts, type ApiClient } from "@stokmate/api-client";

import { usePreferences } from "../../src/preferences";

type ScannerResult = "noMatch" | "ambiguous" | "failed" | null;

export function BarcodeScanner({ apiClient, onClose, visible }: { apiClient: ApiClient; onClose(): void; visible: boolean }) {
  const { colors, t } = usePreferences();
  const [permission, requestPermission] = useCameraPermissions();
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [result, setResult] = useState<ScannerResult>(null);
  const scanLocked = useRef(false);
  const close = useCallback(() => { scanLocked.current = false; setIsLookingUp(false); setResult(null); onClose(); }, [onClose]);
  const retry = useCallback(() => { scanLocked.current = false; setResult(null); }, []);
  const onBarcodeScanned = useCallback(async ({ data }: BarcodeScanningResult) => {
    const barcode = data.trim();
    if (!barcode || scanLocked.current) return;
    scanLocked.current = true;
    setIsLookingUp(true);
    setResult(null);
    try {
      const response = await getProducts({ Q: barcode, Page: 1, PageSize: 100 }, undefined, apiClient.fetch);
      const matches = (response.data.items ?? []).filter((product) => product.barcode === barcode);
      if (matches.length === 1 && matches[0]?.id != null) {
        close();
        router.push({ pathname: "/products/[id]", params: { id: String(matches[0].id) } });
        return;
      }
      setResult(matches.length === 0 ? "noMatch" : "ambiguous");
    } catch { setResult("failed"); } finally { setIsLookingUp(false); }
  }, [apiClient.fetch, close]);
  const denied = permission !== null && !permission.granted;
  return <Modal animationType="slide" onRequestClose={close} visible={visible}><View style={styles.screen}>
    <View style={[styles.header, { backgroundColor: colors.card }]}><Text accessibilityRole="header" style={[styles.title, { color: colors.text }]}>{t("scanner.title")}</Text><Pressable accessibilityLabel={t("scanner.close")} accessibilityRole="button" hitSlop={8} onPress={close} style={styles.close}><Text style={{ color: colors.text }}>{t("scanner.close")}</Text></Pressable></View>
    {!permission || denied ? <View style={[styles.permission, { backgroundColor: colors.background }]}><Text accessibilityRole="header" style={[styles.permissionTitle, { color: colors.text }]}>{t("scanner.permissionTitle")}</Text><Text style={[styles.description, { color: colors.muted }]}>{t("scanner.permissionDescription")}</Text>{permission?.canAskAgain === false ? <Pressable accessibilityRole="button" onPress={() => void Linking.openSettings()} style={styles.button}><Text style={styles.buttonText}>{t("scanner.openSettings")}</Text></Pressable> : <Pressable accessibilityRole="button" onPress={() => void requestPermission()} style={styles.button}><Text style={styles.buttonText}>{t("scanner.request")}</Text></Pressable>}</View> : <View style={styles.cameraArea}>
      <CameraView barcodeScannerSettings={{ barcodeTypes: ["ean13", "ean8", "code128", "code39", "upc_a", "upc_e", "qr"] }} onBarcodeScanned={isLookingUp || result ? undefined : onBarcodeScanned} style={StyleSheet.absoluteFillObject} />
      <View pointerEvents="none" style={styles.frame} /><Text style={styles.instructions}>{isLookingUp ? t("scanner.scanning") : t("scanner.instructions")}</Text>{isLookingUp ? <ActivityIndicator color="#fff" size="large" style={styles.loading} /> : null}{result ? <View style={styles.result}><Text accessibilityLiveRegion="polite" style={styles.resultText}>{t(`scanner.${result}`)}</Text><Pressable accessibilityRole="button" onPress={retry} style={styles.button}><Text style={styles.buttonText}>{t("scanner.retry")}</Text></Pressable></View> : null}
    </View>}</View></Modal>;
}

const styles = StyleSheet.create({ screen: { backgroundColor: "#020617", flex: 1 }, header: { alignItems: "center", backgroundColor: "#fff", flexDirection: "row", justifyContent: "space-between", padding: 20, paddingTop: 56 }, title: { color: "#0f172a", fontSize: 20, fontWeight: "700" }, close: { minHeight: 44, justifyContent: "center", paddingHorizontal: 10 }, cameraArea: { flex: 1, justifyContent: "center" }, frame: { alignSelf: "center", borderColor: "#fff", borderRadius: 12, borderWidth: 2, height: 210, width: "82%" }, instructions: { bottom: 72, color: "#fff", left: 24, position: "absolute", right: 24, textAlign: "center" }, loading: { alignSelf: "center", bottom: 108, position: "absolute" }, permission: { alignItems: "center", backgroundColor: "#f8fafc", flex: 1, gap: 16, justifyContent: "center", padding: 24 }, permissionTitle: { color: "#0f172a", fontSize: 20, fontWeight: "700", textAlign: "center" }, description: { color: "#475569", lineHeight: 22, textAlign: "center" }, button: { alignItems: "center", backgroundColor: "#0f766e", borderRadius: 8, justifyContent: "center", minHeight: 48, paddingHorizontal: 18 }, buttonText: { color: "#fff", fontWeight: "700" }, result: { backgroundColor: "#fffbeb", bottom: 36, gap: 12, left: 20, padding: 16, position: "absolute", right: 20 }, resultText: { color: "#78350f", textAlign: "center" } });
