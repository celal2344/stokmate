import { Modal, Pressable, Text, View } from "react-native";
import { type BrandDto, type CategoryDto } from "@stokmate/api-client";
import { type ProductStatus } from "@stokmate/domain";

import { styles } from "./product-list-styles";

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
  [1, "Aktif"],
  [2, "Pasif"],
  [3, "Kaldırıldı"]
];

export function FilterSheet({
  brands,
  categories,
  onChange,
  onClose,
  value,
  visible
}: FilterSheetProps) {
  const toggle = (key: keyof ProductFilters, id?: number) => {
    const nextValue = value[key] === id ? undefined : id;
    const nextFilters = { ...value, [key]: nextValue };

    if (nextValue === undefined) {
      delete nextFilters[key];
    }

    onChange(nextFilters);
  };

  return (
    <Modal animationType="slide" onRequestClose={onClose} transparent visible={visible}>
      <View style={styles.shade}>
        <View style={styles.sheet}>
          <Text style={styles.sheetTitle}>Filtreler</Text>

          <Text style={styles.label}>Durum</Text>
          <View style={styles.options}>
            {statuses.map(([id, name]) => (
              <FilterOption
                key={id}
                isSelected={value.status === id}
                label={name}
                onPress={() => toggle("status", id)}
              />
            ))}
          </View>

          <Text style={styles.label}>Kategori</Text>
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

          <Text style={styles.label}>Marka</Text>
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

          <Pressable onPress={onClose} style={styles.applyButton}>
            <Text style={styles.applyButtonText}>Uygula</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

function FilterOption({
  isSelected,
  label,
  onPress
}: {
  isSelected: boolean;
  label: string;
  onPress(): void;
}) {
  return (
    <Pressable onPress={onPress} style={[styles.option, isSelected && styles.selectedOption]}>
      <Text>{label}</Text>
    </Pressable>
  );
}
