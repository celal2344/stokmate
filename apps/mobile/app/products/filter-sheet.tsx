import { type BrandDto, type CategoryDto } from "@stokmate/api-client";
import { type ProductStatus } from "@stokmate/domain";
import { Modal, Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useMemo } from "react";

import { usePreferences } from "../../src/preferences";
import { createProductListStyles } from "./product-list-styles";

export type ProductFilters = {
  brandId?: number;
  categoryId?: number;
  status?: ProductStatus;
};

type FilterSheetProps = {
  brands: BrandDto[];
  categories: CategoryDto[];
  onChange(filters: ProductFilters): void;
  onClose(): void;
  value: ProductFilters;
  visible: boolean;
};

const statuses: Array<[ProductStatus, string]> = [
  [1, "status.active"],
  [2, "status.inactive"],
  [3, "status.discontinued"],
];

export function FilterSheet({
  brands,
  categories,
  onChange,
  onClose,
  value,
  visible,
}: FilterSheetProps) {
  const { bottom } = useSafeAreaInsets();
  const { colors, t } = usePreferences();
  const styles = useMemo(() => createProductListStyles(colors), [colors]);

  const toggle = (key: keyof ProductFilters, id?: number) => {
    const nextValue = value[key] === id ? undefined : id;
    const nextFilters = { ...value, [key]: nextValue };

    if (nextValue === undefined) {
      delete nextFilters[key];
    }

    onChange(nextFilters);
  };

  return (
    <Modal
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
      transparent
      visible={visible}
    >
      <View style={styles.shade}>
        <View style={[styles.sheet, { paddingBottom: bottom + 16 }]}>
          <ScrollView bounces={false} showsVerticalScrollIndicator={false}>
            <Text style={styles.sheetTitle}>{t("filters.title")}</Text>

            <Text style={styles.label}>{t("filters.status")}</Text>
            <View style={styles.options}>
              {statuses.map(([id, labelKey]) => (
                <FilterOption
                  key={id}
                  isSelected={value.status === id}
                  label={t(labelKey)}
                  onPress={() => toggle("status", id)}
                />
              ))}
            </View>

            <Text style={styles.label}>{t("filters.category")}</Text>
            <View style={styles.options}>
              {categories.map((category) => (
                <FilterOption
                  key={category.id}
                  isSelected={value.categoryId === category.id}
                  label={category.name ?? "—"}
                  onPress={() => toggle("categoryId", category.id)}
                />
              ))}
            </View>

            <Text style={styles.label}>{t("filters.brand")}</Text>
            <View style={styles.options}>
              {brands.map((brand) => (
                <FilterOption
                  key={brand.id}
                  isSelected={value.brandId === brand.id}
                  label={brand.name ?? "—"}
                  onPress={() => toggle("brandId", brand.id)}
                />
              ))}
            </View>

            <Pressable
              accessibilityLabel={t("filters.apply")}
              accessibilityRole="button"
              onPress={onClose}
              style={styles.applyButton}
            >
              <Text style={styles.applyButtonText}>{t("filters.apply")}</Text>
            </Pressable>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

function FilterOption({
  isSelected,
  label,
  onPress,
}: {
  isSelected: boolean;
  label: string;
  onPress(): void;
}) {
  const { colors } = usePreferences();
  const styles = useMemo(() => createProductListStyles(colors), [colors]);

  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      onPress={onPress}
      style={[styles.option, isSelected && styles.selectedOption]}
    >
      <Text style={styles.optionText}>{label}</Text>
    </Pressable>
  );
}
