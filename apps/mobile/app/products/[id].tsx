import {
  getProductsId,
  patchProductsIdStock,
  type ProductDetailDto,
} from "@stokmate/api-client";
import {
  formatKurus,
  formatStock,
  isNonNegativeInteger,
  productQueryKeys,
} from "@stokmate/domain";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Ionicons } from "@expo/vector-icons";
import { Stack, router, useLocalSearchParams } from "expo-router";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { usePreferences } from "../../src/preferences";
import { useSession } from "../../src/session";

function formatDate(value: string | null | undefined, language: string) {
  if (!value) return "—";

  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat(language === "tr" ? "tr-TR" : "en-US", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(date);
}

function statusKey(status: number | null | undefined) {
  if (status === 1) return "status.active";
  if (status === 2) return "status.inactive";
  if (status === 3) return "status.discontinued";
  return undefined;
}

export default function ProductDetail() {
  const id = Number(useLocalSearchParams<{ id: string }>().id);
  const { apiClient } = useSession();
  const { colors, language, t } = usePreferences();
  const { top } = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const [stock, setStock] = useState("");
  const [feedback, setFeedback] = useState<{
    message: string;
    tone: "error" | "success";
  }>();

  const product = useQuery({
    enabled: Number.isInteger(id),
    queryKey: productQueryKeys.detail(id),
    queryFn: () =>
      getProductsId(id, undefined, apiClient.fetch).then(
        (response) => response.data,
      ),
  });

  const mutation = useMutation({
    mutationFn: (value: number) =>
      patchProductsIdStock(
        id,
        { stock: value },
        undefined,
        apiClient.fetch,
      ).then((response) => response.data),
    onSuccess: (data) => {
      queryClient.setQueryData(
        productQueryKeys.detail(id),
        (old: ProductDetailDto | undefined) => ({ ...old, ...data }),
      );
      void queryClient.invalidateQueries({
        queryKey: productQueryKeys.lists(),
      });
      setStock("");
      setFeedback({ message: t("detail.updatedMessage"), tone: "success" });
    },
    onError: () =>
      setFeedback({ message: t("detail.updateFailed"), tone: "error" }),
  });

  const styles = useMemo(
    () =>
      StyleSheet.create({
        back: {
          alignItems: "center",
          flexDirection: "row",
          gap: 6,
          minHeight: 44,
        },
        card: {
          backgroundColor: colors.subtle,
          borderColor: colors.border,
          borderRadius: 12,
          borderWidth: 1,
          marginTop: 8,
          padding: 18,
        },
        cardLabel: { color: colors.primary, fontWeight: "600" },
        center: {
          alignItems: "center",
          backgroundColor: colors.background,
          flex: 1,
          gap: 12,
          justifyContent: "center",
          padding: 24,
        },
        content: { gap: 10, paddingHorizontal: 20, paddingBottom: 36 },
        field: {
          borderBottomColor: colors.border,
          borderBottomWidth: 1,
          paddingVertical: 10,
        },
        fieldLabel: { color: colors.muted, fontSize: 12 },
        fieldValue: { color: colors.text, marginTop: 3 },
        input: {
          backgroundColor: colors.card,
          borderColor: colors.border,
          borderRadius: 8,
          borderWidth: 1,
          color: colors.text,
          minHeight: 48,
          paddingHorizontal: 12,
        },
        link: { color: colors.primary, fontWeight: "700" },
        minimum: { color: colors.muted, marginTop: 4 },
        safe: { backgroundColor: colors.background, flex: 1 },
        section: {
          color: colors.text,
          fontSize: 17,
          fontWeight: "700",
          marginTop: 16,
        },
        stock: {
          color: colors.primary,
          fontSize: 32,
          fontWeight: "800",
          marginTop: 4,
        },
        title: { color: colors.text, fontSize: 25, fontWeight: "700" },
        updateButton: {
          alignItems: "center",
          backgroundColor: colors.primary,
          borderRadius: 8,
          justifyContent: "center",
          minHeight: 48,
        },
        updateButtonText: {
          color: colors.primaryForeground,
          fontWeight: "700",
        },
      }),
    [colors],
  );

  const goBack = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace("/");
  };

  const save = () => {
    const value = Number(stock);
    if (!isNonNegativeInteger(value)) {
      setFeedback({ message: t("detail.invalidStock"), tone: "error" });
      return;
    }

    mutation.mutate(value);
  };

  if (product.isLoading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator color={colors.primary} size="large" />
      </SafeAreaView>
    );
  }

  if (product.isError || !product.data) {
    return (
      <SafeAreaView style={styles.center}>
        <Text style={{ color: colors.danger }}>{t("detail.loadError")}</Text>
        <Pressable
          accessibilityRole="button"
          onPress={() => void product.refetch()}
        >
          <Text style={styles.link}>{t("detail.retry")}</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  const item = product.data;
  const localizedStatus = statusKey(item.status);
  const fields: Array<[string, unknown]> = [
    [t("detail.sku"), item.sku],
    [t("detail.barcode"), item.barcode],
    [t("detail.category"), item.categoryName],
    [t("detail.brand"), item.brandName],
    [t("detail.supplier"), item.supplierName],
    [
      t("detail.price"),
      formatKurus(item.price ?? 0, language === "tr" ? "tr-TR" : "en-US"),
    ],
    [
      t("detail.costPrice"),
      formatKurus(item.costPrice ?? 0, language === "tr" ? "tr-TR" : "en-US"),
    ],
    [t("detail.unit"), item.unit],
    [t("detail.status"), localizedStatus ? t(localizedStatus) : item.status],
    [t("detail.description"), item.description],
    [t("detail.featured"), item.isFeatured ? t("detail.yes") : t("detail.no")],
    [t("detail.createdAt"), formatDate(item.createdAt, language)],
    [t("detail.updatedAt"), formatDate(item.updatedAt, language)],
  ];

  return (
    <SafeAreaView style={styles.safe}>
      <Stack.Screen options={{ title: item.name ?? t("detail.unnamed") }} />
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: Math.max(top, 12) },
        ]}
      >
        <Pressable
          accessibilityLabel={t("detail.back")}
          accessibilityRole="button"
          hitSlop={6}
          onPress={goBack}
          style={styles.back}
        >
          <Ionicons color={colors.primary} name="arrow-back" size={20} />
          <Text style={styles.link}>{t("detail.back")}</Text>
        </Pressable>
        <Text style={styles.title}>{item.name ?? t("detail.unnamed")}</Text>
        <View style={styles.card}>
          <Text style={styles.cardLabel}>{t("detail.currentStock")}</Text>
          <Text style={styles.stock}>{formatStock(item.stock ?? 0)}</Text>
          <Text style={styles.minimum}>
            {t("detail.minimumStock", {
              stock: formatStock(item.minStock ?? 0),
            })}
          </Text>
        </View>
        <Text style={styles.section}>{t("detail.count")}</Text>
        <TextInput
          accessibilityLabel={t("detail.finalStock")}
          keyboardType="number-pad"
          onChangeText={setStock}
          placeholder={t("detail.finalStock")}
          placeholderTextColor={colors.muted}
          selectionColor={colors.primary}
          style={styles.input}
          value={stock}
        />
        <Pressable
          accessibilityLabel={t("detail.updateStock")}
          accessibilityRole="button"
          disabled={mutation.isPending}
          onPress={save}
          style={[styles.updateButton, mutation.isPending && { opacity: 0.6 }]}
        >
          {mutation.isPending ? (
            <ActivityIndicator color={colors.primaryForeground} />
          ) : (
            <Text style={styles.updateButtonText}>
              {t("detail.updateStock")}
            </Text>
          )}
        </Pressable>
        {feedback ? (
          <View
            accessibilityLiveRegion="polite"
            style={{
              backgroundColor:
                feedback.tone === "error"
                  ? colors.dangerSurface
                  : colors.subtle,
              borderColor:
                feedback.tone === "error" ? colors.danger : colors.primary,
              borderRadius: 8,
              borderWidth: 1,
              padding: 12,
            }}
          >
            <Text
              style={{
                color:
                  feedback.tone === "error" ? colors.danger : colors.primary,
              }}
            >
              {feedback.message}
            </Text>
          </View>
        ) : null}
        <Text style={styles.section}>{t("detail.information")}</Text>
        {fields.map(([label, value]) => (
          <View key={label} style={styles.field}>
            <Text style={styles.fieldLabel}>{label}</Text>
            <Text style={styles.fieldValue}>
              {value == null || value === "" ? "—" : String(value)}
            </Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
