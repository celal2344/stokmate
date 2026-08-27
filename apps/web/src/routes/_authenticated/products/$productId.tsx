import { createFileRoute } from "@tanstack/react-router";
import { ProductDetailPage } from "../../../features/products/product-detail";

export const Route = createFileRoute("/_authenticated/products/$productId")({
  component: ProductDetailPage,
});
