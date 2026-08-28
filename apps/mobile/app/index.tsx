import { FlashList } from "@shopify/flash-list";
import {
  useInfiniteQuery,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { Redirect, useFocusEffect } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  SafeAreaView,
  Text,
  TextInput,
  View,
} from "react-native";
import { getBrands, getCategories, getProducts } from "@stokmate/api-client";
import { lookupQueryKeys, productQueryKeys } from "@stokmate/domain";

import { FilterSheet, type ProductFilters } from "./products/filter-sheet";
import { BarcodeScanner } from "./products/barcode-scanner";
import { ProductRow } from "./products/product-row";
import { createProductListStyles } from "./products/product-list-styles";
import { useSession } from "../src/session";
import { PreferencesControls } from "../src/preferences-controls";
import { usePreferences } from "../src/preferences";

const PAGE_SIZE = 20;

export default function Products() {
  const { isAuthenticated, apiClient, signOut } = useSession();
  const { colors, t } = usePreferences();
  const queryClient = useQueryClient();
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<ProductFilters>({});
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const styles = useMemo(() => createProductListStyles(colors), [colors]);

  useEffect(() => {
    const timeout = setTimeout(() => setSearchQuery(searchInput.trim()), 350);
    return () => clearTimeout(timeout);
  }, [searchInput]);

  const queryFilters = useMemo(
    () => ({ q: searchQuery, ...filters }),
    [filters, searchQuery],
  );

  const products = useInfiniteQuery({
    queryKey: productQueryKeys.list(queryFilters),
    initialPageParam: 1,
    queryFn: ({ pageParam }) =>
      getProducts(
        {
          Q: searchQuery || undefined,
          CategoryId: filters.categoryId,
          BrandId: filters.brandId,
          Status: filters.status,
          Page: pageParam,
          PageSize: PAGE_SIZE,
        },
        undefined,
        apiClient.fetch,
      ).then((response) => response.data),
    getNextPageParam: (lastPage) =>
      (lastPage.page ?? 1) * (lastPage.pageSize ?? PAGE_SIZE) <
      (lastPage.total ?? 0)
        ? (lastPage.page ?? 1) + 1
        : undefined,
  });

  const categories = useQuery({
    queryKey: lookupQueryKeys.categories(),
    queryFn: () =>
      getCategories(undefined, apiClient.fetch).then(
        (response) => response.data,
      ),
  });

  const brands = useQuery({
    queryKey: lookupQueryKeys.brands(),
    queryFn: () =>
      getBrands(undefined, apiClient.fetch).then((response) => response.data),
  });

  useFocusEffect(
    useCallback(() => {
      void queryClient.invalidateQueries({
        queryKey: productQueryKeys.lists(),
      });
    }, [queryClient]),
  );

  if (!isAuthenticated) {
    return <Redirect href="/login" />;
  }

  const items = products.data?.pages.flatMap((page) => page.items ?? []) ?? [];
  const hasActiveFilters = Object.values(filters).some(
    (value) => value !== undefined,
  );

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>{t("products.title")}</Text>
            <Text style={styles.muted}>
              {t("products.count", {
                count: products.data?.pages[0]?.total ?? 0,
              })}
            </Text>
          </View>
          <View style={styles.headerActions}>
            <PreferencesControls />
            <Pressable
              accessibilityLabel={t("products.logout")}
              accessibilityRole="button"
              hitSlop={8}
              onPress={() => void signOut()}
              style={styles.signOut}
            >
              <Text style={styles.link}>{t("products.logout")}</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.searchLine}>
          <TextInput
            accessibilityLabel={t("products.search")}
            onChangeText={setSearchInput}
            placeholder={t("products.search")}
            style={styles.search}
            placeholderTextColor={colors.muted}
            value={searchInput}
          />
          <Pressable
            accessibilityLabel={t("products.filters")}
            accessibilityRole="button"
            onPress={() => setIsFilterSheetOpen(true)}
            style={styles.filterButton}
          >
            <Text style={{ color: colors.primary }}>
              {t("products.filters")}
            </Text>
          </Pressable>
          <Pressable
            accessibilityLabel={t("scanner.open")}
            accessibilityRole="button"
            onPress={() => setIsScannerOpen(true)}
            style={styles.scanButton}
          >
            <Text style={{ color: colors.primary }}>{t("products.scan")}</Text>
          </Pressable>
        </View>

        {hasActiveFilters ? (
          <View style={styles.chips}>
            <Text style={styles.chip}>{t("products.activeFilters")}</Text>
            <Pressable onPress={() => setFilters({})}>
              <Text style={styles.link}>{t("products.clear")}</Text>
            </Pressable>
          </View>
        ) : null}

        {products.isLoading ? (
          <ActivityIndicator
            color={colors.primary}
            size="large"
            style={styles.center}
          />
        ) : products.isError ? (
          <View style={styles.center}>
            <Text style={styles.error}>{t("products.loadError")}</Text>
            <Pressable onPress={() => void products.refetch()}>
              <Text style={styles.link}>{t("products.retry")}</Text>
            </Pressable>
          </View>
        ) : items.length === 0 ? (
          <View style={styles.center}>
            <Text style={{ color: colors.text }}>{t("products.empty")}</Text>
          </View>
        ) : (
          <FlashList
            data={items}
            keyExtractor={(item) => String(item.id)}
            ListFooterComponent={
              <View style={styles.footer}>
                {products.hasNextPage ? (
                  <Pressable
                    disabled={products.isFetchingNextPage}
                    onPress={() => void products.fetchNextPage()}
                    style={styles.loadButton}
                  >
                    {products.isFetchingNextPage ? (
                      <ActivityIndicator color={colors.primary} />
                    ) : (
                      <Text style={{ color: colors.primary }}>
                        {t("products.loadMore")}
                      </Text>
                    )}
                  </Pressable>
                ) : (
                  <Text style={styles.muted}>{t("products.end")}</Text>
                )}
              </View>
            }
            refreshControl={
              <RefreshControl
                colors={[colors.primary]}
                onRefresh={() => void products.refetch()}
                progressBackgroundColor={colors.card}
                refreshing={products.isRefetching}
                tintColor={colors.primary}
              />
            }
            renderItem={({ item }) => <ProductRow item={item} />}
          />
        )}
      </View>

      <FilterSheet
        brands={brands.data ?? []}
        categories={categories.data ?? []}
        onChange={setFilters}
        onClose={() => setIsFilterSheetOpen(false)}
        value={filters}
        visible={isFilterSheetOpen}
      />
      <BarcodeScanner
        apiClient={apiClient}
        onClose={() => setIsScannerOpen(false)}
        visible={isScannerOpen}
      />
    </SafeAreaView>
  );
}
