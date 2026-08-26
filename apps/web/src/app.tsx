import { type FormEvent, useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Navigate, Route, Routes, useNavigate, useSearchParams } from "react-router";
import { getBrands, getCategories, getProducts, getProductsStats, type GetProductsParams, type ProductDto } from "@stokmate/api-client";
import { formatKurus, formatStock, productQueryKeys, productStatus } from "@stokmate/domain";
import { useAuth } from "./auth";

const pageSizeOptions = [10, 20, 50];
const sortOptions = [["name", "Ad"], ["price", "Fiyat"], ["stock", "Stok"], ["updatedAt", "Güncelleme"]] as const;

function positiveInt(value: string | null, fallback: number) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}
function optionalId(value: string | null) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : undefined;
}
function useDocumentVisible() {
  const [visible, setVisible] = useState(() => document.visibilityState === "visible");
  useEffect(() => {
    const update = () => setVisible(document.visibilityState === "visible");
    document.addEventListener("visibilitychange", update);
    return () => document.removeEventListener("visibilitychange", update);
  }, []);
  return visible;
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isRestoring } = useAuth();
  if (isRestoring) return <main className="centered-state">Oturum geri yükleniyor…</main>;
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

export function App() {
  return <Routes>
    <Route path="/login" element={<LoginPage />} />
    <Route path="/products" element={<ProtectedRoute><ProductsPage /></ProtectedRoute>} />
    <Route path="*" element={<Navigate to="/products" replace />} />
  </Routes>;
}

function LoginPage() {
  const { isAuthenticated, isRestoring, login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string>();
  const [submitting, setSubmitting] = useState(false);
  if (!isRestoring && isAuthenticated) return <Navigate to="/products" replace />;
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setError(undefined); setSubmitting(true);
    try { await login(email.trim(), password); navigate("/products", { replace: true }); }
    catch (reason) { setError(reason instanceof Error ? reason.message : "Giriş yapılamadı."); }
    finally { setSubmitting(false); }
  };
  return <main className="login-page"><form className="login-card" onSubmit={submit}>
    <p className="eyebrow">StokMate</p><h1>Stok yönetimine giriş yapın</h1>
    <label>E-posta<input autoComplete="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required /></label>
    <label>Şifre<input autoComplete="current-password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} required /></label>
    {error ? <p className="error" role="alert">{error}</p> : null}
    <button type="submit" disabled={submitting}>{submitting ? "Giriş yapılıyor…" : "Giriş yap"}</button>
  </form></main>;
}

function ProductsPage() {
  const { apiClient, logout, user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const visible = useDocumentVisible();
  const urlSearch = searchParams.get("q") ?? "";
  const [searchInput, setSearchInput] = useState(urlSearch);
  const [debouncedSearch, setDebouncedSearch] = useState(urlSearch);
  useEffect(() => setSearchInput(urlSearch), [urlSearch]);
  useEffect(() => {
    const timeout = window.setTimeout(() => setDebouncedSearch(searchInput.trim()), 350);
    return () => window.clearTimeout(timeout);
  }, [searchInput]);
  const filters = useMemo<GetProductsParams>(() => {
    const status = Number(searchParams.get("status"));
    return {
      Q: debouncedSearch || undefined,
      CategoryId: optionalId(searchParams.get("categoryId")),
      BrandId: optionalId(searchParams.get("brandId")),
      Status: status === 1 || status === 2 || status === 3 ? status : undefined,
      Page: positiveInt(searchParams.get("page"), 1),
      PageSize: pageSizeOptions.includes(Number(searchParams.get("pageSize"))) ? Number(searchParams.get("pageSize")) : 20,
      Sort: sortOptions.some(([value]) => value === searchParams.get("sort")) ? searchParams.get("sort") ?? "name" : "name",
      Dir: searchParams.get("dir") === "desc" ? "desc" : "asc",
    };
  }, [debouncedSearch, searchParams]);
  const queryOptions = { refetchInterval: visible ? 30_000 : false, refetchOnWindowFocus: true } as const;
  const productsQuery = useQuery({ queryKey: productQueryKeys.list(filters), queryFn: () => getProducts(filters, undefined, apiClient.fetch).then((response) => response.data), ...queryOptions });
  const statsQuery = useQuery({ queryKey: productQueryKeys.stats(), queryFn: () => getProductsStats(undefined, apiClient.fetch).then((response) => response.data), ...queryOptions });
  const categoriesQuery = useQuery({ queryKey: ["categories"], queryFn: () => getCategories(undefined, apiClient.fetch).then((response) => response.data) });
  const brandsQuery = useQuery({ queryKey: ["brands"], queryFn: () => getBrands(undefined, apiClient.fetch).then((response) => response.data) });
  const updateParams = (updates: Record<string, string | undefined>, resetPage = true) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => value ? next.set(key, value) : next.delete(key));
    if (resetPage) next.delete("page");
    setSearchParams(next);
  };
  const result = productsQuery.data;
  const currentPage = filters.Page ?? 1;
  const totalPages = Math.max(1, Math.ceil((result?.total ?? 0) / (filters.PageSize ?? 20)));
  const signOut = async () => { await logout(); navigate("/login", { replace: true }); };
  return <main className="app-shell">
    <header className="app-header"><div><p className="eyebrow">StokMate</p><h1>Ürünler</h1></div><div className="account"><span>{user?.fullName ?? user?.email}</span><button className="secondary" onClick={() => void signOut()}>Çıkış yap</button></div></header>
    <section className="kpi-grid" aria-label="Stok özeti"><Kpi label="Toplam ürün" value={statsQuery.data?.total} loading={statsQuery.isLoading} /><Kpi label="Kritik stok" value={statsQuery.data?.lowStock} loading={statsQuery.isLoading} tone="warning" /><Kpi label="Tükenen" value={statsQuery.data?.outOfStock} loading={statsQuery.isLoading} tone="danger" /></section>
    <section className="product-panel">
      <div className="toolbar">
        <label className="search-field">Ara (ad, SKU veya barkod)<input value={searchInput} onChange={(event) => { setSearchInput(event.target.value); updateParams({ q: event.target.value || undefined }); }} placeholder="Ürün ara" /></label>
        <label>Kategori<select value={searchParams.get("categoryId") ?? ""} onChange={(event) => updateParams({ categoryId: event.target.value || undefined })}><option value="">Tümü</option>{categoriesQuery.data?.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
        <label>Marka<select value={searchParams.get("brandId") ?? ""} onChange={(event) => updateParams({ brandId: event.target.value || undefined })}><option value="">Tümü</option>{brandsQuery.data?.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
        <label>Durum<select value={searchParams.get("status") ?? ""} onChange={(event) => updateParams({ status: event.target.value || undefined })}><option value="">Tümü</option><option value="1">Aktif</option><option value="2">Pasif</option><option value="3">Satış dışı</option></select></label>
        <label>Sırala<select value={filters.Sort} onChange={(event) => updateParams({ sort: event.target.value })}>{sortOptions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
        <label>Yön<select value={filters.Dir} onChange={(event) => updateParams({ dir: event.target.value })}><option value="asc">Artan</option><option value="desc">Azalan</option></select></label>
      </div>
      {productsQuery.isLoading ? <div className="state">Ürünler yükleniyor…</div> : null}
      {productsQuery.isError ? <div className="state error" role="alert"><p>Ürünler yüklenemedi.</p><button onClick={() => void productsQuery.refetch()}>Tekrar dene</button></div> : null}
      {!productsQuery.isLoading && !productsQuery.isError && !result?.items?.length ? <div className="state">Bu ölçütlere uyan ürün bulunamadı.</div> : null}
      {result?.items?.length ? <ProductTable products={result.items} /> : null}
      <footer className="pagination"><span>{result?.total ?? 0} ürün</span><label>Sayfa boyutu<select value={filters.PageSize} onChange={(event) => updateParams({ pageSize: event.target.value })}>{pageSizeOptions.map((size) => <option key={size} value={size}>{size}</option>)}</select></label><div className="page-buttons"><button className="secondary" disabled={currentPage <= 1} onClick={() => updateParams({ page: String(currentPage - 1) }, false)}>Önceki</button>{Array.from({ length: totalPages }, (_, index) => index + 1).slice(Math.max(0, currentPage - 3), currentPage + 2).map((page) => <button key={page} className={page === currentPage ? "active-page" : "secondary"} onClick={() => updateParams({ page: String(page) }, false)}>{page}</button>)}<button className="secondary" disabled={currentPage >= totalPages} onClick={() => updateParams({ page: String(currentPage + 1) }, false)}>Sonraki</button></div></footer>
    </section>
  </main>;
}

function Kpi({ label, value, loading, tone }: { label: string; value?: number; loading: boolean; tone?: string }) { return <article className={`kpi ${tone ?? ""}`}><span>{label}</span><strong>{loading ? "—" : formatStock(value ?? 0)}</strong></article>; }
function ProductTable({ products }: { products: ProductDto[] }) { return <div className="table-wrap"><table><thead><tr><th>Ürün</th><th>Sınıflandırma</th><th>Fiyat</th><th>Stok</th><th>Durum</th><th>Güncelleme</th></tr></thead><tbody>{products.map((product) => <tr key={product.id}><td className="identity">{product.imageUrl ? <img src={product.imageUrl} alt="" /> : <span className="product-image-placeholder" />}<div><strong>{product.name ?? "Adsız ürün"}</strong><small>{product.sku ?? "SKU yok"} · {product.barcode ?? "Barkod yok"}</small></div></td><td>{product.categoryName ?? "—"}<small>{product.brandName ?? "—"}</small></td><td>{formatKurus(product.price ?? 0)}</td><td className={(product.stock ?? 0) <= (product.minStock ?? 0) ? "low-stock" : ""}>{formatStock(product.stock ?? 0)}</td><td><span className={`status status-${product.status ?? 0}`}>{statusLabel(product.status)}</span></td><td>{product.updatedAt ? new Intl.DateTimeFormat("tr-TR", { dateStyle: "short", timeStyle: "short" }).format(new Date(product.updatedAt)) : "—"}</td></tr>)}</tbody></table></div>; }
function statusLabel(status: number | undefined) { if (status === productStatus.active) return "Aktif"; if (status === productStatus.inactive) return "Pasif"; if (status === productStatus.discontinued) return "Satış dışı"; return "Bilinmiyor"; }
