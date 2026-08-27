import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { ProductsPage } from "../../../features/products/product-list";

const pageSizes = [10, 20, 50] as const;
const sortValues = ["name", "price", "stock", "updatedAt"] as const;
const optionalId = z.coerce
  .number()
  .int()
  .positive()
  .optional()
  .catch(undefined);
export const productListSearchSchema = z.object({
  q: z.string().catch("").default(""),
  categoryId: optionalId,
  brandId: optionalId,
  status: z.coerce
    .number()
    .int()
    .refine((value) => [1, 2, 3].includes(value))
    .optional()
    .catch(undefined),
  sort: z.enum(sortValues).catch("name").default("name"),
  dir: z.enum(["asc", "desc"]).catch("asc").default("asc"),
  page: z.coerce.number().int().positive().catch(1).default(1),
  pageSize: z.coerce
    .number()
    .refine((value) => pageSizes.includes(value as (typeof pageSizes)[number]))
    .catch(20)
    .default(20),
});

export const Route = createFileRoute("/_authenticated/products/")({
  validateSearch: (search) => productListSearchSchema.parse(search),
  component: ProductsPage,
});
