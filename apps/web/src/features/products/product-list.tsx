import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  createColumnHelper,
  tableFeatures,
  useTable,
  type ColumnDef,
} from "@tanstack/react-table";
import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import {
  getBrands,
  getCategories,
  getProducts,
  getProductsStats,
  type GetProductsParams,
  type ProductDto,
} from "@stokmate/api-client";
import { lookupQueryKeys, productQueryKeys } from "@stokmate/domain";
import { useAuth } from "../../auth";
import { PreferencesControls } from "../../components/preferences-controls";
import { Alert } from "../../components/ui/alert";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import { Input } from "../../components/ui/input";
import { Pagination } from "../../components/ui/pagination";
import { Select } from "../../components/ui/select";
import { Skeleton } from "../../components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { Route } from "../../routes/_authenticated/products/index";
import {
  dateValue,
  formatKurus,
  formatStock,
  pageSizes,
  sortOptions,
  statusLabel,
} from "./helpers";

const features = tableFeatures({});
const columnHelper = createColumnHelper<typeof features, ProductDto>();
type ListSearch = ReturnType<typeof Route.useSearch>;

function Kpi({
  label,
  value,
  loading,
  variant = "default",
}: {
  label: string;
  value?: number;
  loading: boolean;
  variant?: "default" | "warning" | "destructive";
}) {
  const { t } = useTranslation();
  return (
    <article className="rounded-lg border bg-card p-4 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm text-muted-foreground">{label}</span>
        <Badge variant={variant === "default" ? "secondary" : variant}>
          {variant === "warning"
            ? t("lowStock")
            : variant === "destructive"
              ? t("outOfStock")
              : t("totalProducts")}
        </Badge>
      </div>
      {loading ? (
        <Skeleton className="mt-3 h-8 w-16" />
      ) : (
        <strong className="mt-3 block text-3xl">
          {formatStock(value ?? 0)}
        </strong>
      )}
    </article>
  );
}

function ProductTable({
  products,
  sort,
  dir,
  onSort,
  locale,
}: {
  products: ProductDto[];
  sort: string;
  dir: string;
  onSort(next: string): void;
  locale: string;
}) {
  const { t } = useTranslation();
  const columns = useMemo<Array<ColumnDef<typeof features, ProductDto>>>(
    () =>
      columnHelper.columns([
        columnHelper.display({
          id: "product",
          header: t("product"),
          cell: ({ row }) => (
            <div className="flex min-w-56 items-center gap-3">
              {row.original.imageUrl ? (
                <img
                  className="size-10 rounded object-cover"
                  src={row.original.imageUrl}
                  alt=""
                />
              ) : (
                <span className="size-10 rounded bg-muted" />
              )}
              <div>
                <Link
                  className="font-medium text-primary hover:underline"
                  to="/products/$productId"
                  params={{ productId: String(row.original.id) }}
                >
                  {row.original.name ?? "—"}
                </Link>
                <small className="block text-muted-foreground">
                  {row.original.sku ?? t("noSku")} ·{" "}
                  {row.original.barcode ?? t("noBarcode")}
                </small>
              </div>
            </div>
          ),
        }),
        columnHelper.display({
          id: "classification",
          header: t("classification"),
          cell: ({ row }) => (
            <>
              {row.original.categoryName ?? "—"}
              <small className="block text-muted-foreground">
                {row.original.brandName ?? "—"}
              </small>
            </>
          ),
        }),
        columnHelper.display({
          id: "price",
          header: t("price"),
          cell: ({ row }) =>
            formatKurus(
              row.original.price ?? 0,
              locale === "en" ? "en-US" : "tr-TR",
            ),
        }),
        columnHelper.display({
          id: "stock",
          header: t("stock"),
          cell: ({ row }) => {
            const low =
              (row.original.stock ?? 0) <= (row.original.minStock ?? 0);
            return (
              <span
                className={
                  low
                    ? "font-semibold text-amber-700 dark:text-amber-300"
                    : undefined
                }
              >
                {formatStock(row.original.stock ?? 0, locale)}
              </span>
            );
          },
        }),
        columnHelper.display({
          id: "status",
          header: t("status"),
          cell: ({ row }) => (
            <Badge
              variant={
                row.original.status === 3
                  ? "destructive"
                  : row.original.status === 2
                    ? "warning"
                    : "secondary"
              }
            >
              {statusLabel(row.original.status, t)}
            </Badge>
          ),
        }),
        columnHelper.display({
          id: "updatedAt",
          header: t("updatedAt"),
          cell: ({ row }) => dateValue(row.original.updatedAt, locale),
        }),
      ]),
    [locale, t],
  );
  const table = useTable({
    key: "products",
    features,
    data: products,
    columns,
  });
  const sortable: Record<string, string> = {
    product: "name",
    price: "price",
    stock: "stock",
    updatedAt: "updatedAt",
  };
  return (
    <Table>
      <TableHeader>
        {table.getHeaderGroups().map((group) => (
          <TableRow key={group.id}>
            {group.headers.map((header) => {
              const key = sortable[header.column.id];
              const active = key === sort;
              return (
                <TableHead key={header.id}>
                  {header.isPlaceholder ? null : key ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="-ml-3"
                      aria-label={t("sortColumn", {
                        column: header.column.columnDef.header,
                      })}
                      onClick={() => onSort(key)}
                    >
                      <table.FlexRender header={header} />
                      {active ? (dir === "asc" ? " ↑" : " ↓") : " ↕"}
                    </Button>
                  ) : (
                    <table.FlexRender header={header} />
                  )}
                </TableHead>
              );
            })}
          </TableRow>
        ))}
      </TableHeader>
      <TableBody>
        {table.getRowModel().rows.map((row) => (
          <TableRow key={row.id}>
            {row.getAllCells().map((cell) => (
              <TableCell key={cell.id}>
                <table.FlexRender cell={cell} />
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export function ProductsPage() {
  const { apiClient, logout, user } = useAuth();
  const { t, i18n } = useTranslation();
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const [input, setInput] = useState(search.q);
  const [debouncedSearch, setDebouncedSearch] = useState(search.q);
  const [visible, setVisible] = useState(
    document.visibilityState === "visible",
  );
  useEffect(() => setInput(search.q), [search.q]);
  useEffect(() => {
    const timer = window.setTimeout(
      () => setDebouncedSearch(input.trim()),
      350,
    );
    return () => window.clearTimeout(timer);
  }, [input]);
  useEffect(() => {
    const listener = () => setVisible(document.visibilityState === "visible");
    document.addEventListener("visibilitychange", listener);
    return () => document.removeEventListener("visibilitychange", listener);
  }, []);
  useEffect(() => {
    if (debouncedSearch !== search.q)
      void navigate({
        search: (previous) => ({ ...previous, q: debouncedSearch, page: 1 }),
      });
  }, [debouncedSearch, navigate, search.q]);
  const filters = useMemo<GetProductsParams>(
    () => ({
      Q: search.q || undefined,
      CategoryId: search.categoryId,
      BrandId: search.brandId,
      Status: search.status as 1 | 2 | 3 | undefined,
      Page: search.page,
      PageSize: search.pageSize,
      Sort: search.sort,
      Dir: search.dir,
    }),
    [search],
  );
  const polling = {
    refetchInterval: visible ? 30_000 : false,
    refetchOnWindowFocus: true,
  } as const;
  const products = useQuery({
    queryKey: productQueryKeys.list(filters),
    queryFn: () =>
      getProducts(filters, undefined, apiClient.fetch).then(
        (response) => response.data,
      ),
    ...polling,
  });
  const stats = useQuery({
    queryKey: productQueryKeys.stats(),
    queryFn: () =>
      getProductsStats(undefined, apiClient.fetch).then(
        (response) => response.data,
      ),
    ...polling,
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
  const update = (patch: Partial<ListSearch>, reset = true) =>
    void navigate({
      search: (previous) => ({
        ...previous,
        ...patch,
        page: reset ? 1 : (patch.page ?? previous.page),
      }),
    });
  const page = search.page;
  const totalPages = Math.max(
    1,
    Math.ceil((products.data?.total ?? 0) / search.pageSize),
  );
  const toggleSort = (sort: string) =>
    update({
      sort: sort as ListSearch["sort"],
      dir: search.sort === sort && search.dir === "asc" ? "desc" : "asc",
    });
  const sortKey =
    sortOptions.find(([value]) => value === search.sort)?.[1] ?? "sort";
  return (
    <main className="mx-auto max-w-7xl p-4 md:p-8">
      <header className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold tracking-wider text-primary uppercase">
            StokMate
          </p>
          <h1 className="text-3xl font-semibold">{t("products")}</h1>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <PreferencesControls />
          <span className="text-sm text-muted-foreground">
            {user?.fullName ?? user?.email}
          </span>
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
      <section
        className="mb-4 grid gap-4 md:grid-cols-3"
        aria-label={t("inventory")}
      >
        <Kpi
          label={t("totalProducts")}
          value={stats.data?.total}
          loading={stats.isLoading}
        />
        <Kpi
          label={t("lowStock")}
          value={stats.data?.lowStock}
          loading={stats.isLoading}
          variant="warning"
        />
        <Kpi
          label={t("outOfStock")}
          value={stats.data?.outOfStock}
          loading={stats.isLoading}
          variant="destructive"
        />
      </section>
      <section className="overflow-hidden rounded-lg border bg-card shadow-sm">
        <div className="grid gap-3 border-b p-4 md:grid-cols-3 lg:grid-cols-5">
          <label className="grid gap-1 text-sm font-medium md:col-span-3 lg:col-span-1">
            {t("searchProducts")}
            <Input
              value={input}
              onChange={(event) => setInput(event.target.value)}
            />
          </label>
          <label className="grid gap-1 text-sm font-medium">
            {t("category")}
            <Select
              value={String(search.categoryId ?? "")}
              onChange={(event) =>
                update({
                  categoryId: event.target.value
                    ? Number(event.target.value)
                    : undefined,
                })
              }
            >
              <option value="">{t("all")}</option>
              {categories.data?.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name ?? "—"}
                </option>
              ))}
            </Select>
          </label>
          <label className="grid gap-1 text-sm font-medium">
            {t("brand")}
            <Select
              value={String(search.brandId ?? "")}
              onChange={(event) =>
                update({
                  brandId: event.target.value
                    ? Number(event.target.value)
                    : undefined,
                })
              }
            >
              <option value="">{t("all")}</option>
              {brands.data?.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name ?? "—"}
                </option>
              ))}
            </Select>
          </label>
          <label className="grid gap-1 text-sm font-medium">
            {t("status")}
            <Select
              value={String(search.status ?? "")}
              onChange={(event) =>
                update({
                  status: event.target.value
                    ? (Number(event.target.value) as 1 | 2 | 3)
                    : undefined,
                })
              }
            >
              <option value="">{t("all")}</option>
              <option value="1">{t("active")}</option>
              <option value="2">{t("inactive")}</option>
              <option value="3">{t("discontinued")}</option>
            </Select>
          </label>
          <div className="grid gap-1 text-sm font-medium">
            <span>{t("sort")}</span>
            <DropdownMenu>
              <DropdownMenuTrigger>
                {t(sortKey)} · {search.dir === "asc" ? "↑" : "↓"}
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {sortOptions.map(([value, labelKey]) => (
                  <DropdownMenuItem
                    key={value}
                    onClick={() => toggleSort(value)}
                  >
                    {t(labelKey)}{" "}
                    {search.sort === value
                      ? search.dir === "asc"
                        ? "↑"
                        : "↓"
                      : ""}
                  </DropdownMenuItem>
                ))}
                <DropdownMenuItem
                  onClick={() =>
                    update({ dir: search.dir === "asc" ? "desc" : "asc" })
                  }
                >
                  {t("changeSortDirection")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        {products.isLoading ? (
          <div className="space-y-3 p-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : products.isError ? (
          <Alert
            className="m-4 border-destructive text-destructive"
            role="alert"
          >
            <p>{t("loadError")}</p>
            <Button
              className="mt-3"
              variant="outline"
              onClick={() => void products.refetch()}
            >
              {t("retry")}
            </Button>
          </Alert>
        ) : !products.data?.items?.length ? (
          <div className="p-12 text-center text-muted-foreground">
            {t("emptyProducts")}
          </div>
        ) : (
          <ProductTable
            products={products.data.items}
            sort={search.sort}
            dir={search.dir}
            onSort={toggleSort}
            locale={i18n.language}
          />
        )}
        <footer className="flex flex-wrap items-center justify-between gap-3 border-t p-4 text-sm text-muted-foreground">
          <span>{t("productCount", { count: products.data?.total ?? 0 })}</span>
          <label className="grid gap-1 text-sm font-medium">
            {t("pageSize")}
            <Select
              value={String(search.pageSize)}
              onChange={(event) =>
                update({
                  pageSize: Number(
                    event.target.value,
                  ) as ListSearch["pageSize"],
                })
              }
            >
              {pageSizes.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </Select>
          </label>
          <Pagination className="gap-1">
            <Button
              size="sm"
              variant="outline"
              disabled={page === 1}
              onClick={() => update({ page: page - 1 }, false)}
            >
              {t("previousPage")}
            </Button>
            {Array.from({ length: totalPages }, (_, index) => index + 1)
              .slice(Math.max(0, page - 3), page + 2)
              .map((value) => (
                <Button
                  key={value}
                  size="sm"
                  variant={value === page ? "default" : "outline"}
                  onClick={() => update({ page: value }, false)}
                >
                  {value}
                </Button>
              ))}
            <Button
              size="sm"
              variant="outline"
              disabled={page === totalPages}
              onClick={() => update({ page: page + 1 }, false)}
            >
              {t("nextPage")}
            </Button>
          </Pagination>
        </footer>
      </section>
    </main>
  );
}
