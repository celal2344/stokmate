import {
  createContext,
  useContext,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";
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
import { i18n } from "./i18n";

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
  async set(tokens) {
    window.localStorage.setItem(tokenStorageKey, JSON.stringify(tokens));
  },
  async clear() {
    window.localStorage.removeItem(tokenStorageKey);
  },
};

export interface AuthContextValue {
  apiClient: ApiClient;
  isRestoring: boolean;
  isAuthenticated: boolean;
  user: UserDto | undefined;
  login(email: string, password: string): Promise<void>;
  logout(): Promise<void>;
}

export const apiBaseUrl =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5080";

type AuthSnapshot = Pick<
  AuthContextValue,
  "isRestoring" | "isAuthenticated" | "user"
>;

class BrowserAuthService {
  private listeners = new Set<() => void>();
  private restorePromise: Promise<void> | undefined;
  private snapshot: AuthSnapshot = {
    isRestoring: true,
    isAuthenticated: false,
    user: undefined,
  };
  readonly apiClient: ApiClient;
  get isRestoring() {
    return this.snapshot.isRestoring;
  }
  get isAuthenticated() {
    return this.snapshot.isAuthenticated;
  }
  async getAccessToken() {
    return (await browserTokenStore.get())?.accessToken ?? "";
  }

  constructor() {
    this.apiClient = createApiClient({
      baseUrl: apiBaseUrl,
      tokenStore: browserTokenStore,
      onUnauthorized: () => this.setUser(undefined),
    });
  }

  subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };
  getSnapshot = () => this.snapshot;
  private publish() {
    this.listeners.forEach((listener) => listener());
  }
  private setUser(user: UserDto | undefined) {
    this.snapshot = { ...this.snapshot, user, isAuthenticated: Boolean(user) };
    this.publish();
  }

  async ensureRestored() {
    if (!this.restorePromise) {
      this.restorePromise = (async () => {
        const tokens = await browserTokenStore.get();
        if (tokens) {
          try {
            this.setUser(
              (await getAuthMe(undefined, this.apiClient.fetch)).data,
            );
          } catch {
            /* shared client handles expiry */
          }
        }
        this.snapshot = { ...this.snapshot, isRestoring: false };
        this.publish();
      })();
    }
    return this.restorePromise;
  }

  async login(email: string, password: string) {
    const response = await postAuthLogin(
      { email, password },
      undefined,
      this.apiClient.fetch,
    );
    const { accessToken, refreshToken, user: nextUser } = response.data;
    if (!accessToken || !refreshToken)
      throw new Error(i18n.t("invalidLoginResponse"));
    await browserTokenStore.set({ accessToken, refreshToken });
    this.setUser(nextUser);
  }

  async logout() {
    const tokens = await browserTokenStore.get();
    try {
      if (tokens?.refreshToken)
        await postAuthLogout(
          { refreshToken: tokens.refreshToken },
          undefined,
          this.apiClient.fetch,
        );
    } finally {
      await browserTokenStore.clear();
      this.setUser(undefined);
    }
  }
}

export const browserAuth = new BrowserAuthService();
const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const snapshot = useSyncExternalStore(
    browserAuth.subscribe,
    browserAuth.getSnapshot,
    browserAuth.getSnapshot,
  );
  void browserAuth.ensureRestored();

  const value = useMemo<AuthContextValue>(
    () => ({
      apiClient: browserAuth.apiClient,
      ...snapshot,
      login: (email, password) => browserAuth.login(email, password),
      logout: () => browserAuth.logout(),
    }),
    [snapshot],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider.");
  return context;
}
