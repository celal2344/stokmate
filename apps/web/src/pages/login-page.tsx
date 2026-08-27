import { type FormEvent, useState } from "react";
import { Navigate, useNavigate } from "react-router";
import { Alert } from "../components/ui/alert";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { useAuth } from "../auth";

export function LoginPage() {
  const { isAuthenticated, isRestoring, login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string>();
  const [submitting, setSubmitting] = useState(false);
  if (!isRestoring && isAuthenticated) return <Navigate to="/products" replace />;
  const submit = async (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); setSubmitting(true); setError(undefined); try { await login(email.trim(), password); navigate("/products", { replace: true }); } catch (reason) { setError(reason instanceof Error ? reason.message : "Giriş yapılamadı."); } finally { setSubmitting(false); } };
  return <main className="grid min-h-screen place-items-center bg-muted/30 p-6"><form className="grid w-full max-w-md gap-5 rounded-xl border bg-card p-8 shadow-sm" onSubmit={submit}><div><p className="text-sm font-semibold uppercase tracking-wider text-primary">StokMate</p><h1 className="mt-2 text-2xl font-semibold">Stok yönetimine giriş yapın</h1></div><label className="grid gap-2 text-sm font-medium">E-posta<Input autoComplete="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required /></label><label className="grid gap-2 text-sm font-medium">Şifre<Input autoComplete="current-password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} required /></label>{error && <Alert className="border-destructive text-destructive" role="alert">{error}</Alert>}<Button type="submit" disabled={submitting}>{submitting ? "Giriş yapılıyor…" : "Giriş yap"}</Button></form></main>;
}
