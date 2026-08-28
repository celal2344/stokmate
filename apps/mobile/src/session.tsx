import {
  createApiClient,
  postAuthLogin,
  postAuthLogout,
  type ApiClient,
  type AuthTokens,
  type TokenStore,
} from "@stokmate/api-client";
import * as SecureStore from "expo-secure-store";
import { router } from "expo-router";
import i18n from "i18next";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from "react";

const ACCESS_TOKEN_KEY = "stokmate.access-token";
const REFRESH_TOKEN_KEY = "stokmate.refresh-token";
const API_URL_KEY = "stokmate.api-url";
const defaultApiUrl =
  process.env.EXPO_PUBLIC_API_BASE_URL ?? "http://10.0.2.2:5080";

export interface SessionContextValue {
  apiUrl: string;
  apiClient: ApiClient;
  isRestoring: boolean;
  isAuthenticated: boolean;
  saveApiUrl(value: string): Promise<void>;
  signIn(email: string, password: string, apiUrl: string): Promise<void>;
  signOut(): Promise<void>;
}

const SessionContext = createContext<SessionContextValue | null>(null);

const tokenStore: TokenStore = {
  async get() {
    const [accessToken, refreshToken] = await Promise.all([
      SecureStore.getItemAsync(ACCESS_TOKEN_KEY),
      SecureStore.getItemAsync(REFRESH_TOKEN_KEY),
    ]);
    return accessToken && refreshToken ? { accessToken, refreshToken } : null;
  },
  async set(tokens) {
    await Promise.all([
      SecureStore.setItemAsync(ACCESS_TOKEN_KEY, tokens.accessToken),
      SecureStore.setItemAsync(REFRESH_TOKEN_KEY, tokens.refreshToken),
    ]);
  },
  async clear() {
    await Promise.all([
      SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY),
      SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY),
    ]);
  },
};

export function validateApiUrl(value: string): string {
  const normalized = value.trim().replace(/\/$/, "");
  let url: URL;
  try {
    url = new URL(normalized);
  } catch {
    throw new Error(i18n.t("session.invalidUrl"));
  }

  if (
    !url.hostname ||
    (url.protocol !== "http:" && url.protocol !== "https:")
  ) {
    throw new Error(i18n.t("session.invalidProtocol"));
  }
  return normalized;
}

export function SessionProvider({ children }: PropsWithChildren) {
  const [apiUrl, setApiUrl] = useState(defaultApiUrl);
  const [tokens, setTokens] = useState<AuthTokens | null>(null);
  const [isRestoring, setIsRestoring] = useState(true);

  const handleUnauthorized = useCallback(async () => {
    await tokenStore.clear();
    setTokens(null);
    router.replace("/login");
  }, []);

  const apiClient = useMemo(
    () =>
      createApiClient({
        baseUrl: apiUrl,
        tokenStore,
        onUnauthorized: handleUnauthorized,
      }),
    [apiUrl, handleUnauthorized],
  );

  useEffect(() => {
    let active = true;
    void Promise.all([SecureStore.getItemAsync(API_URL_KEY), tokenStore.get()])
      .then(([storedUrl, storedTokens]) => {
        if (!active) return;
        if (storedUrl) {
          try {
            setApiUrl(validateApiUrl(storedUrl));
          } catch {
            void SecureStore.deleteItemAsync(API_URL_KEY);
          }
        }
        setTokens(storedTokens);
      })
      .finally(() => {
        if (active) setIsRestoring(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const saveApiUrl = useCallback(async (value: string) => {
    const validated = validateApiUrl(value);
    await SecureStore.setItemAsync(API_URL_KEY, validated);
    setApiUrl(validated);
  }, []);

  const signIn = useCallback(
    async (email: string, password: string, requestedApiUrl: string) => {
      const validatedUrl = validateApiUrl(requestedApiUrl);
      const loginClient = createApiClient({
        baseUrl: validatedUrl,
        tokenStore,
        onUnauthorized: handleUnauthorized,
      });
      let response;
      try {
        response = await postAuthLogin(
          { email, password },
          undefined,
          loginClient.fetch,
        );
      } catch (error) {
        if (error instanceof TypeError) {
          throw new Error(i18n.t("session.unreachable"));
        }
        throw error;
      }
      const accessToken = response.data.accessToken;
      const refreshToken = response.data.refreshToken;
      if (!accessToken || !refreshToken) {
        throw new Error(i18n.t("session.invalidLoginResponse"));
      }
      const nextTokens = { accessToken, refreshToken };
      await Promise.all([
        tokenStore.set(nextTokens),
        SecureStore.setItemAsync(API_URL_KEY, validatedUrl),
      ]);
      setApiUrl(validatedUrl);
      setTokens(nextTokens);
      router.replace("/");
    },
    [handleUnauthorized],
  );

  const signOut = useCallback(async () => {
    const currentTokens = await tokenStore.get();
    try {
      if (currentTokens)
        await postAuthLogout(
          { refreshToken: currentTokens.refreshToken },
          undefined,
          apiClient.fetch,
        );
    } catch {
      // Local sign-out must succeed even if the server is currently unavailable.
    } finally {
      await tokenStore.clear();
      setTokens(null);
      router.replace("/login");
    }
  }, [apiClient]);

  const value = useMemo(
    () => ({
      apiUrl,
      apiClient,
      isRestoring,
      isAuthenticated: tokens !== null,
      saveApiUrl,
      signIn,
      signOut,
    }),
    [apiClient, apiUrl, isRestoring, saveApiUrl, signIn, signOut, tokens],
  );

  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
}

export function useSession(): SessionContextValue {
  const context = useContext(SessionContext);
  if (!context)
    throw new Error("useSession must be used inside SessionProvider.");
  return context;
}
