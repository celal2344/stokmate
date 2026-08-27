import { FlashList } from "@shopify/flash-list";
import { useInfiniteQuery, useQuery, useQueryClient } from "@tanstack/react-query";
import { Redirect, useFocusEffect } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  SafeAreaView,
  Text,
  TextInput,
  View
} from "react-native";
import { getBrands, getCategories, getProducts } from "@stokmate/api-client";
import { lookupQueryKeys, productQueryKeys } from "@stokmate/domain";

import { FilterSheet, type ProductFilters } from "./products/filter-sheet";
import { ProductRow } from "./products/product-row";
import { styles } from "./products/product-list-styles";
import { useSession } from "../src/session";

const PAGE_SIZE = 20;

export default function Products() {
  const { isAuthenticated, apiClient, signOut } = useSession();
  const queryClient = useQueryClient();
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<ProductFilters>({});
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => setSearchQuery(searchInput.trim()), 350);
    return () => clearTimeout(timeout);
  }, [searchInput]);

  const queryFilters = useMemo(
    () => ({ q: searchQuery, ...filters }),
    [filters, searchQuery]
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
          PageSize: PAGE_SIZE
        },
        undefined,
        apiClient.fetch
      ).then((response) => response.data),
    getNextPageParam: (lastPage) =>
      (lastPage.page ?? 1) * (lastPage.pageSize ?? PAGE_SIZE) < (lastPage.total ?? 0)
        ? (lastPage.page ?? 1) + 1
        : undefined
  });

  const categories = useQuery({
    queryKey: lookupQueryKeys.categories(),
    queryFn: () => getCategories(undefined, apiClient.fetch).then((response) => response.data)
  });

  const brands = useQuery({
    queryKey: lookupQueryKeys.brands(),
    queryFn: () => getBrands(undefined, apiClient.fetch).then((response) => response.data)
  });

  useFocusEffect(
    useCallback(() => {
      void queryClient.invalidateQueries({ queryKey: productQueryKeys.lists() });
    }, [queryClient])
  );

  if (!isAuthenticated) {
    return <Redirect href="/login" />;
  }

  const items = products.data?.pages.flatMap((page) => page.items ?? []) ?? [];
  const hasActiveFilters = Object.values(filters).some((value) => value !== undefined);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Ürünler</Text>
            <Text style={styles.muted}>{products.data?.pages[0]?.total ?? 0} kayıt</Text>
          </View>
          <Pressable onPress={() => void signOut()}>
            <Text style={styles.link}>Çıkış</Text>
          </Pressable>
        </View>

        <View style={styles.searchLine}>
          <TextInput
            accessibilityLabel="Ürün ara"
            onChangeText={setSearchInput}
            placeholder="Ürün, SKU veya barkod ara"
            style={styles.search}
            value={searchInput}
          />
          <Pressable onPress={() => setIsFilterSheetOpen(true)} style={styles.filterButton}>
            <Text>Filtreler</Text>
          </Pressable>
        </View>

        {hasActiveFilters ? (
          <View style={styles.chips}>
            <Text style={styles.chip}>Aktif filtreler</Text>
            <Pressable onPress={() => setFilters({})}>
              <Text style={styles.link}>Temizle</Text>
            </Pressable>
          </View>
        ) : null}

        {products.isLoading ? (
          <ActivityIndicator size="large" style={styles.center} />
        ) : products.isError ? (
          <View style={styles.center}>
            <Text style={styles.error}>Ürünler yüklenemedi.</Text>
            <Pressable onPress={() => void products.refetch()}>
              <Text style={styles.link}>Yeniden dene</Text>
            </Pressable>
          </View>
        ) : items.length === 0 ? (
          <View style={styles.center}>
            <Text>Ürün bulunamadı.</Text>
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
                    {products.isFetchingNextPage ? <ActivityIndicator /> : <Text>Devamını yükle</Text>}
                  </Pressable>
                ) : (
                  <Text style={styles.muted}>Listenin sonu</Text>
                )}
              </View>
            }
            refreshControl={
              <RefreshControl
                onRefresh={() => void products.refetch()}
                refreshing={products.isRefetching}
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
    </SafeAreaView>
  );
}
