import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  createApiClient,
  getAuthMe,
  postAuthLogin,
  postAuthLogout,
  type ApiClient,
  type AuthTokens,
  type TokenStore,
  type UserDto,
} from "@stokmate/api-client";

const tokenStorageKey = "stokmate.web.tokens";

const browserTokenStore: TokenStore = {
  async get() {
    const rawTokens = window.localStorage.getItem(tokenStorageKey);
    if (!rawTokens) return null;
    try {
      const tokens = JSON.parse(rawTokens) as Partial<AuthTokens>;
      return tokens.accessToken && tokens.refreshToken
        ? { accessToken: tokens.accessToken, refreshToken: tokens.refreshToken }
        : null;
    } catch {
      window.localStorage.removeItem(tokenStorageKey);
      return null;
    }
  },
  async set(tokens) { window.localStorage.setItem(tokenStorageKey, JSON.stringify(tokens)); },
  async clear() { window.localStorage.removeItem(tokenStorageKey); },
};

interface AuthContextValue {
  apiClient: ApiClient;
  isRestoring: boolean;
  isAuthenticated: boolean;
  user: UserDto | undefined;
  login(email: string, password: string): Promise<void>;
  logout(): Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5080";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isRestoring, setIsRestoring] = useState(true);
  const [user, setUser] = useState<UserDto>();
  const handleUnauthorized = useCallback(() => { setUser(undefined); }, []);
  const apiClient = useMemo(
    () => createApiClient({ baseUrl: apiBaseUrl, tokenStore: browserTokenStore, onUnauthorized: handleUnauthorized }),
    [handleUnauthorized],
  );

  useEffect(() => {
    let active = true;
    const restore = async () => {
      const tokens = await browserTokenStore.get();
      if (!tokens) { if (active) setIsRestoring(false); return; }
      try {
        const response = await getAuthMe(undefined, apiClient.fetch);
        if (active) setUser(response.data);
      } catch {
        // The shared client clears an expired session and invokes onUnauthorized.
      } finally {
        if (active) setIsRestoring(false);
      }
    };
    void restore();
    return () => { active = false; };
  }, [apiClient]);

  const login = useCallback(async (email: string, password: string) => {
    const response = await postAuthLogin({ email, password }, undefined, apiClient.fetch);
    const { accessToken, refreshToken, user: nextUser } = response.data;
    if (!accessToken || !refreshToken) throw new Error("Giriş yanıtı geçerli bir oturum anahtarı içermiyor.");
    await browserTokenStore.set({ accessToken, refreshToken });
    setUser(nextUser);
  }, [apiClient]);

  const logout = useCallback(async () => {
    const tokens = await browserTokenStore.get();
    try {
      if (tokens?.refreshToken) await postAuthLogout({ refreshToken: tokens.refreshToken }, undefined, apiClient.fetch);
    } finally {
      await browserTokenStore.clear();
      setUser(undefined);
    }
  }, [apiClient]);

  const value = useMemo<AuthContextValue>(() => ({
    apiClient, isRestoring, isAuthenticated: Boolean(user), user, login, logout,
  }), [apiClient, isRestoring, user, login, logout]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider.");
  return context;
}
