import { normalizeApiError } from "./api-error.js";

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface TokenStore {
  get(): Promise<AuthTokens | null>;
  set(tokens: AuthTokens): Promise<void>;
  clear(): Promise<void>;
}

export interface ApiClientOptions {
  baseUrl: string;
  tokenStore: TokenStore;
  onUnauthorized(): void | Promise<void>;
  fetch?: typeof fetch;
}

export interface ApiClient {
  fetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response>;
}

export function createApiClient(options: ApiClientOptions): ApiClient {
  const fetchImplementation = options.fetch ?? globalThis.fetch;
  const baseUrl = options.baseUrl.replace(/\/$/, "");
  let refreshInFlight: Promise<AuthTokens | null> | undefined;
  let sessionInvalidation: Promise<void> | undefined;

  const toUrl = (input: RequestInfo | URL) =>
    typeof input === "string" && input.startsWith("/") ? `${baseUrl}${input}` : input;

  const invalidateSession = () => {
    sessionInvalidation ??= (async () => {
      await options.tokenStore.clear();
      await options.onUnauthorized();
    })();

    return sessionInvalidation;
  };

  const refresh = () => {
    refreshInFlight ??= (async () => {
      const tokens = await options.tokenStore.get();
      if (!tokens?.refreshToken) {
        return null;
      }

      const response = await fetchImplementation(`${baseUrl}/auth/refresh`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ refreshToken: tokens.refreshToken })
      });

      if (!response.ok) {
        return null;
      }

      const nextTokens = (await response.json()) as Partial<AuthTokens>;
      if (!nextTokens.accessToken || !nextTokens.refreshToken) {
        return null;
      }

      const rotatedTokens = {
        accessToken: nextTokens.accessToken,
        refreshToken: nextTokens.refreshToken
      };
      await options.tokenStore.set(rotatedTokens);
      return rotatedTokens;
    })().finally(() => {
      refreshInFlight = undefined;
    });

    return refreshInFlight;
  };

  const request = async (
    input: RequestInfo | URL,
    init: RequestInit = {},
    retried = false
  ): Promise<Response> => {
    const tokens = await options.tokenStore.get();
    const headers = new Headers(init.headers);

    if (tokens?.accessToken) {
      headers.set("authorization", `Bearer ${tokens.accessToken}`);
    }

    const response = await fetchImplementation(toUrl(input), { ...init, headers });

    if (response.status === 401 && !retried) {
      const refreshed = await refresh();
      if (refreshed) {
        return request(input, init, true);
      }

      await invalidateSession();
    }

    if (!response.ok) {
      throw await normalizeApiError(response);
    }

    return response;
  };

  return { fetch: request };
}
