import { useState, type ReactNode } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "@tanstack/react-form";
import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { z } from "zod";
import {
  getProductsId,
  patchProductsId,
  type ProductDetailDto,
} from "@stokmate/api-client";
import { productQueryKeys } from "@stokmate/domain";
import { useAuth } from "../../auth";
import { PreferencesControls } from "../../components/preferences-controls";
import { Alert } from "../../components/ui/alert";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "../../components/ui/field";
import { Input } from "../../components/ui/input";
import { Select } from "../../components/ui/select";
import { Skeleton } from "../../components/ui/skeleton";
import { Route } from "../../routes/_authenticated/products/$productId";
import {
  dateValue,
  formatKurus,
  formatStock,
  statusLabel,
  tlToKurus,
} from "./helpers";

type EditValues = {
  name: string;
  price: string;
  stock: string;
  status: "1" | "2" | "3";
};

function EditForm({
  product,
  saving,
  onSave,
  onCancel,
}: {
  product: ProductDetailDto;
  saving: boolean;
  onSave(values: EditValues): Promise<void>;
  onCancel(): void;
}) {
  const { t } = useTranslation();
  const form = useForm({
    defaultValues: {
      name: product.name ?? "",
      price: ((product.price ?? 0) / 100).toFixed(2).replace(".", ","),
      stock: String(product.stock ?? 0),
      status: String(product.status ?? 1) as EditValues["status"],
    },
    validators: {
      onSubmit: z.object({
        name: z.string().trim().min(1, t("required")),
        price: z
          .string()
          .refine((value) => tlToKurus(value) !== null, t("invalidPrice")),
        stock: z.string().regex(/^\d+$/, t("invalidStock")),
        status: z.enum(["1", "2", "3"]),
      }),
    },
    onSubmit: async ({ value }) => onSave(value),
  });
  return (
    <section className="max-w-3xl border border-border bg-card p-5 md:p-6">
      <div className="mb-5 border-b border-border pb-4">
        <h2 className="text-xl font-semibold tracking-tight">{t("edit")}</h2>
      </div>
      <form
        className="grid gap-4"
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          void form.handleSubmit();
        }}
      >
        <FieldGroup>
          <form.Field name="name">
            {(field) => {
              const invalid =
                field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field data-invalid={invalid}>
                  <FieldLabel htmlFor={field.name}>{t("name")}</FieldLabel>
                  <Input
                    id={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(event) => field.handleChange(event.target.value)}
                    aria-invalid={invalid}
                  />
                  {invalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              );
            }}
          </form.Field>
          <form.Field name="price">
            {(field) => {
              const invalid =
                field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field data-invalid={invalid}>
                  <FieldLabel htmlFor={field.name}>{t("price")}</FieldLabel>
                  <Input
                    id={field.name}
                    inputMode="decimal"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(event) => field.handleChange(event.target.value)}
                    aria-invalid={invalid}
                  />
                  {invalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              );
            }}
          </form.Field>
          <form.Field name="stock">
            {(field) => {
              const invalid =
                field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field data-invalid={invalid}>
                  <FieldLabel htmlFor={field.name}>{t("stock")}</FieldLabel>
                  <Input
                    id={field.name}
                    inputMode="numeric"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(event) => field.handleChange(event.target.value)}
                    aria-invalid={invalid}
                  />
                  {invalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              );
            }}
          </form.Field>
          <form.Field name="status">
            {(field) => {
              const invalid =
                field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field data-invalid={invalid}>
                  <FieldLabel htmlFor={field.name}>{t("status")}</FieldLabel>
                  <Select
                    id={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(event) =>
                      field.handleChange(
                        event.target.value as EditValues["status"],
                      )
                    }
                    aria-invalid={invalid}
                  >
                    <option value="1">{t("active")}</option>
                    <option value="2">{t("inactive")}</option>
                    <option value="3">{t("discontinued")}</option>
                  </Select>
                  {invalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              );
            }}
          </form.Field>
        </FieldGroup>
        <form.Subscribe
          selector={(state) => [state.isSubmitting, state.canSubmit] as const}
        >
          {([submitting, canSubmit]) => (
            <div className="flex gap-3">
              <Button
                type="submit"
                disabled={saving || submitting || !canSubmit}
              >
                {saving ? t("saving") : t("save")}
              </Button>
              <Button variant="outline" onClick={onCancel}>
                {t("cancel")}
              </Button>
            </div>
          )}
        </form.Subscribe>
      </form>
    </section>
  );
}

function ProductRecord({
  product,
  locale,
}: {
  product: ProductDetailDto;
  locale: string;
}) {
  const { t } = useTranslation();
  const rows: [string, ReactNode][] = [
    [t("sku"), product.sku ?? "—"],
    [t("barcode"), product.barcode ?? "—"],
    [t("category"), product.categoryName ?? "—"],
    [t("brand"), product.brandName ?? "—"],
    [t("supplier"), product.supplierName ?? "—"],
    [
      t("price"),
      formatKurus(product.price ?? 0, locale === "en" ? "en-US" : "tr-TR"),
    ],
    [
      t("costPrice"),
      formatKurus(product.costPrice ?? 0, locale === "en" ? "en-US" : "tr-TR"),
    ],
    [t("stock"), formatStock(product.stock ?? 0, locale)],
    [t("minStock"), formatStock(product.minStock ?? 0, locale)],
    [
      t("unit"),
      product.unit === 1
        ? t("unitPiece")
        : product.unit === 2
          ? t("unitKilogram")
          : product.unit === 3
            ? t("unitLiter")
            : product.unit === 4
              ? t("unitPackage")
              : "—",
    ],
    [
      t("status"),
      <Badge
        key="status"
        variant={
          product.status === 3
            ? "destructive"
            : product.status === 2
              ? "warning"
              : "secondary"
        }
      >
        {statusLabel(product.status, t)}
      </Badge>,
    ],
    [t("featured"), product.isFeatured ? t("yes") : t("no")],
    [t("description"), product.description ?? "—"],
    [t("createdAt"), dateValue(product.createdAt, locale)],
    [t("updatedAt"), dateValue(product.updatedAt, locale)],
  ];
  return (
    <section className="border border-border bg-card p-5 md:p-6">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-4 border-b border-border pb-4">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">
            {t("details")}
          </h2>
        </div>
        {product.imageUrl && (
          <img
            className="size-20 rounded-md border border-border object-cover"
            src={product.imageUrl}
            alt=""
          />
        )}
      </div>
      <dl className="grid divide-y divide-border md:grid-cols-2 md:gap-x-8 md:[&>div:nth-child(2)]:border-t-0">
        {rows.map(([label, value]) => (
          <div key={label} className="py-3">
            <dt className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              {label}
            </dt>
            <dd className="mt-1 text-sm break-words">{value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

export function ProductDetailPage() {
  const { t, i18n } = useTranslation();
  const { productId } = Route.useParams();
  const navigate = Route.useNavigate();
  const { apiClient, logout } = useAuth();
  const cache = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [feedback, setFeedback] = useState<string>();
  const id = Number(productId);
  const valid = Number.isInteger(id) && id > 0;
  const query = useQuery({
    queryKey: productQueryKeys.detail(id),
    enabled: valid,
    queryFn: () =>
      getProductsId(id, undefined, apiClient.fetch).then(
        (response) => response.data,
      ),
    refetchOnWindowFocus: true,
  });
  const save = useMutation({
    mutationFn: (value: EditValues) =>
      patchProductsId(
        id,
        {
          name: value.name.trim(),
          price: tlToKurus(value.price) ?? undefined,
          stock: Number(value.stock),
          status: Number(value.status) as 1 | 2 | 3,
        },
        undefined,
        apiClient.fetch,
      ).then((response) => response.data),
    onSuccess: (product) => {
      cache.setQueryData(productQueryKeys.detail(id), product);
      void cache.invalidateQueries({ queryKey: productQueryKeys.lists() });
      void cache.invalidateQueries({ queryKey: productQueryKeys.stats() });
      setEditing(false);
      setFeedback(t("updateSuccess"));
    },
    onError: () => setFeedback(t("updateError")),
  });
  const productSearch = {
    q: "",
    sort: "name" as const,
    dir: "asc" as const,
    page: 1,
    pageSize: 20,
  };
  if (!valid || (query.error as { status?: number } | null)?.status === 404)
    return (
      <main className="grid min-h-screen place-items-center p-6">
        <h1 className="sr-only">{t("productDetails")}</h1>
        <Alert role="alert">
          <p>{t("notFound")}</p>
          <Link
            className="mt-3 inline-block text-primary hover:underline"
            to="/products"
            search={productSearch}
          >
            {t("backToProducts")}
          </Link>
        </Alert>
      </main>
    );
  if (query.isLoading)
    return (
      <main className="mx-auto max-w-[90rem] p-8">
        <h1 className="sr-only">{t("productDetails")}</h1>
        <Skeleton className="h-10 w-48" />
        <Skeleton className="mt-6 h-96 w-full" />
      </main>
    );
  if (query.isError || !query.data)
    return (
      <main className="grid min-h-screen place-items-center p-6">
        <h1 className="sr-only">{t("productDetails")}</h1>
        <Alert className="border-destructive text-destructive" role="alert">
          <p>{t("loadError")}</p>
          <Button
            className="mt-3"
            variant="outline"
            onClick={() => void query.refetch()}
          >
            {t("retry")}
          </Button>
        </Alert>
      </main>
    );
  const product = query.data;
  return (
    <main className="mx-auto max-w-[90rem] px-4 py-5 md:px-8 md:py-8">
      <header className="mb-7 flex flex-wrap items-end justify-between gap-5 border-b border-border pb-5">
        <div>
          <Link
            className="text-sm text-primary underline-offset-4 hover:underline"
            to="/products"
            search={productSearch}
          >
            ← {t("backToProducts")}
          </Link>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight">
            {product.name ?? t("productDetails")}
          </h1>
        </div>
        <div className="flex flex-wrap items-end gap-3">
          <PreferencesControls />
          <Button
            onClick={() => {
              setEditing(true);
              setFeedback(undefined);
            }}
          >
            {t("edit")}
          </Button>
          <Button
            variant="outline"
            onClick={() =>
              void logout().then(() =>
                navigate({ to: "/login", replace: true }),
              )
            }
          >
            {t("logout")}
          </Button>
        </div>
      </header>
      {feedback && (
        <Alert className="mb-5 border-primary/30" role="status">
          {feedback}
        </Alert>
      )}
      {editing ? (
        <EditForm
          product={product}
          saving={save.isPending}
          onSave={async (values) => {
            await save.mutateAsync(values);
          }}
          onCancel={() => setEditing(false)}
        />
      ) : (
        <ProductRecord product={product} locale={i18n.language} />
      )}
    </main>
  );
}
