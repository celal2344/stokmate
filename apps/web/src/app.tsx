import type { ReactNode } from "react";
import { Navigate, Route, Routes } from "react-router";
import { useAuth } from "./auth";
import { ProductDetailPage } from "./features/products/product-detail";
import { ProductsPage } from "./features/products/product-list";
import { LoginPage } from "./pages/login-page";

function ProtectedRoute({ children }: { children: ReactNode }) {
  const auth = useAuth();
  if (auth.isRestoring) return <main className="grid min-h-screen place-items-center">Oturum geri yükleniyor…</main>;
  return auth.isAuthenticated ? children : <Navigate to="/login" replace />;
}

export function App() {
  return <Routes><Route path="/login" element={<LoginPage />} /><Route path="/products" element={<ProtectedRoute><ProductsPage /></ProtectedRoute>} /><Route path="/products/:id" element={<ProtectedRoute><ProductDetailPage /></ProtectedRoute>} /><Route path="*" element={<Navigate to="/products" replace />} /></Routes>;
}
