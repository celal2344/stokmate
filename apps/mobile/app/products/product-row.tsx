import { Image } from "expo-image";
import { Link } from "expo-router";
import { memo, type ComponentType } from "react";
import { Pressable, Text, View } from "react-native";
import { type ProductDto } from "@stokmate/api-client";
import { formatKurus, formatStock } from "@stokmate/domain";

import { styles } from "./product-list-styles";

const ProductImage = Image as unknown as ComponentType<{
  contentFit: "cover";
  recyclingKey: string;
  source?: string;
  style: object;
}>;

export const ProductRow = memo(function ProductRow({ item }: { item: ProductDto }) {
  const isAtMinimumStock = (item.stock ?? 0) <= (item.minStock ?? 0);

  return (
    <Link asChild href={{ pathname: "/products/[id]", params: { id: String(item.id) } }}>
      <Pressable style={styles.row}>
        <ProductImage
          contentFit="cover"
          recyclingKey={String(item.id)}
          source={item.imageUrl ?? undefined}
          style={styles.image}
        />
        <View style={styles.rowBody}>
          <Text numberOfLines={1} style={styles.name}>
            {item.name ?? "Adsız ürün"}
          </Text>
          <Text style={styles.muted}>
            {item.sku ?? "—"} · {item.categoryName ?? "—"}
          </Text>
          <Text style={styles.price}>{formatKurus(item.price ?? 0)}</Text>
        </View>
        <Text style={[styles.stock, isAtMinimumStock && styles.lowStock]}>
          {formatStock(item.stock ?? 0)}
        </Text>
      </Pressable>
    </Link>
  );
});
