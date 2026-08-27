import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Link, useParams } from "react-router";
import { z } from "zod";
import { getProductsId, patchProductsId, type ProductDetailDto } from "@stokmate/api-client";
import { productQueryKeys } from "@stokmate/domain";
import { Alert } from "../../components/ui/alert";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Skeleton } from "../../components/ui/skeleton";
import { PreferencesControls } from "../../components/preferences-controls";
import { useAuth } from "../../auth";
import { dateValue, formatKurus, formatStock, statusLabel, tlToKurus } from "./helpers";

type EditValues = { name: string; price: string; stock: string; status: "1" | "2" | "3" };
const editSchema = z.object({ name: z.string().trim().min(1, "required"), price: z.string().refine((value) => tlToKurus(value) !== null, "invalidPrice"), stock: z.string().regex(/^\d+$/, "invalidStock"), status: z.enum(["1", "2", "3"]) });

function EditForm({ form, saving, onSubmit, onCancel }: { form: ReturnType<typeof useForm<EditValues>>; saving: boolean; onSubmit(values: EditValues): void; onCancel(): void }) {
  const { t } = useTranslation();
  const error = (key: keyof EditValues) => form.formState.errors[key]?.message;
  return <section className="max-w-2xl rounded-lg border bg-card p-6 shadow-sm"><h2 className="mb-5 text-xl font-semibold">{t("edit")}</h2><form className="grid gap-4" onSubmit={form.handleSubmit(onSubmit)} noValidate><label className="grid gap-2 text-sm font-medium">{t("name")}<Input {...form.register("name")} aria-invalid={Boolean(error("name"))} />{error("name") && <small className="text-destructive">{t(error("name") as "required")}</small>}</label><label className="grid gap-2 text-sm font-medium">{t("price")}<Input inputMode="decimal" {...form.register("price")} aria-invalid={Boolean(error("price"))} />{error("price") && <small className="text-destructive">{t(error("price") as "invalidPrice")}</small>}</label><label className="grid gap-2 text-sm font-medium">{t("stock")}<Input inputMode="numeric" {...form.register("stock")} aria-invalid={Boolean(error("stock"))} />{error("stock") && <small className="text-destructive">{t(error("stock") as "invalidStock")}</small>}</label><label className="grid gap-2 text-sm font-medium">{t("status")}<select className="h-10 rounded-md border border-input bg-background px-3 text-sm" {...form.register("status")}><option value="1">{t("active")}</option><option value="2">{t("inactive")}</option><option value="3">{t("discontinued")}</option></select></label><div className="flex gap-3"><Button type="submit" disabled={saving}>{saving ? t("saving") : t("save")}</Button><Button variant="outline" onClick={onCancel}>{t("cancel")}</Button></div></form></section>;
}

function ProductRecord({ product, locale }: { product: ProductDetailDto; locale: string }) {
  const { t } = useTranslation();
  const rows: [string, React.ReactNode][] = [[t("sku"), product.sku ?? "—"], [t("barcode"), product.barcode ?? "—"], [t("category"), product.categoryName ?? "—"], [t("brand"), product.brandName ?? "—"], [t("supplier"), product.supplierName ?? "—"], [t("price"), formatKurus(product.price ?? 0, locale === "en" ? "en-US" : "tr-TR")], [t("costPrice"), formatKurus(product.costPrice ?? 0, locale === "en" ? "en-US" : "tr-TR")], [t("stock"), formatStock(product.stock ?? 0, locale)], [t("minStock"), formatStock(product.minStock ?? 0, locale)], [t("unit"), product.unit === 1 ? "Adet" : product.unit === 2 ? "kg" : product.unit === 3 ? "L" : product.unit === 4 ? "Paket" : "—"], [t("status"), <Badge key="status" variant={product.status === 3 ? "destructive" : product.status === 2 ? "warning" : "secondary"}>{statusLabel(product.status)}</Badge>], [t("featured"), product.isFeatured ? "✓" : "—"], [t("description"), product.description ?? "—"], [t("createdAt"), dateValue(product.createdAt, locale)], [t("updatedAt"), dateValue(product.updatedAt, locale)]];
  return <section className="rounded-lg border bg-card p-6 shadow-sm"><h2 className="mb-4 text-xl font-semibold">{t("details")}</h2>{product.imageUrl && <img className="mb-4 max-h-48 w-full max-w-48 rounded-lg object-cover" src={product.imageUrl} alt="" />}<dl className="grid gap-4 md:grid-cols-2">{rows.map(([label, value]) => <div key={label} className="border-t pt-3"><dt className="text-sm font-medium text-muted-foreground">{label}</dt><dd className="mt-1 break-words">{value}</dd></div>)}</dl></section>;
}

export function ProductDetailPage() {
  const { t, i18n } = useTranslation();
  const { id: rawId } = useParams();
  const { apiClient } = useAuth();
  const cache = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [feedback, setFeedback] = useState<string>();
  const id = Number(rawId);
  const valid = Number.isInteger(id) && id > 0;
  const query = useQuery({ queryKey: productQueryKeys.detail(id), enabled: valid, queryFn: () => getProductsId(id, undefined, apiClient.fetch).then((response) => response.data), refetchOnWindowFocus: true });
  const form = useForm<EditValues>({ resolver: zodResolver(editSchema) });
  const save = useMutation({ mutationFn: (value: EditValues) => patchProductsId(id, { name: value.name.trim(), price: tlToKurus(value.price) ?? undefined, stock: Number(value.stock), status: Number(value.status) as 1 | 2 | 3 }, undefined, apiClient.fetch).then((response) => response.data), onSuccess: (product) => { cache.setQueryData(productQueryKeys.detail(id), product); void cache.invalidateQueries({ queryKey: productQueryKeys.lists() }); void cache.invalidateQueries({ queryKey: productQueryKeys.stats() }); setEditing(false); setFeedback(t("updateSuccess")); }, onError: () => setFeedback(t("updateError")) });
  if (!valid || (query.error as { status?: number } | null)?.status === 404) return <main className="grid min-h-screen place-items-center p-6"><Alert role="alert"><p>{t("notFound")}</p><Link className="mt-3 inline-block text-primary hover:underline" to="/products">{t("backToProducts")}</Link></Alert></main>;
  if (query.isLoading) return <main className="mx-auto max-w-7xl p-8"><Skeleton className="h-10 w-48" /><Skeleton className="mt-6 h-96 w-full" /></main>;
  if (query.isError || !query.data) return <main className="grid min-h-screen place-items-center p-6"><Alert className="border-destructive text-destructive" role="alert"><p>{t("loadError")}</p><Button className="mt-3" variant="outline" onClick={() => void query.refetch()}>{t("retry")}</Button></Alert></main>;
  const product = query.data;
  const edit = () => { form.reset({ name: product.name ?? "", price: ((product.price ?? 0) / 100).toFixed(2).replace(".", ","), stock: String(product.stock ?? 0), status: String(product.status ?? 1) as EditValues["status"] }); setEditing(true); setFeedback(undefined); };
  return <main className="mx-auto max-w-7xl p-4 md:p-8"><header className="mb-6 flex flex-wrap items-start justify-between gap-4"><div><Link className="text-sm text-primary hover:underline" to="/products">← {t("backToProducts")}</Link><p className="mt-3 text-sm font-semibold uppercase tracking-wider text-primary">StokMate</p><h1 className="text-3xl font-semibold">{product.name ?? t("productDetails")}</h1></div><div className="flex items-center gap-3"><PreferencesControls /><Button onClick={edit}>{t("edit")}</Button></div></header>{feedback && <Alert className="mb-4" role="status">{feedback}</Alert>}{editing ? <EditForm form={form} saving={save.isPending} onSubmit={(values) => save.mutate(values)} onCancel={() => setEditing(false)} /> : <ProductRecord product={product} locale={i18n.language} />}</main>;
}
