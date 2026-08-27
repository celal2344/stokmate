import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { useQueryClient, type QueryClient } from "@tanstack/react-query";
import {
  HubConnectionBuilder,
  LogLevel,
  type HubConnection,
} from "@microsoft/signalr";
import { productQueryKeys } from "@stokmate/domain";
import { apiBaseUrl, browserAuth, useAuth } from "./auth";

export type ProductEventsConnectionState =
  "connected" | "reconnecting" | "disconnected";

type ProductChangedEvent = {
  productId: number;
  changeType: "created" | "updated" | "stockUpdated" | "deleted";
  updatedAt: string;
};

const ProductEventsContext =
  createContext<ProductEventsConnectionState>("disconnected");

class ProductEventsConnection {
  private connection: HubConnection | undefined;
  private lifecycle = Promise.resolve();
  private listeners = new Set<() => void>();
  private state: ProductEventsConnectionState = "disconnected";

  constructor(private readonly queryClient: QueryClient) {}

  subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  getSnapshot = () => this.state;

  start(baseUrl: string, accessTokenFactory: () => Promise<string>) {
    this.lifecycle = this.lifecycle.then(async () => {
      if (this.connection) return;

      const connection = new HubConnectionBuilder()
        .withUrl(`${baseUrl.replace(/\/$/, "")}/hubs/products`, {
          accessTokenFactory,
        })
        .withAutomaticReconnect()
        .configureLogging(LogLevel.None)
        .build();

      connection.on("productChanged", (event: ProductChangedEvent) => {
        if (!Number.isInteger(event?.productId) || event.productId < 1) return;
        void this.invalidateForProduct(event.productId);
      });
      connection.onreconnecting(() => this.setState("reconnecting"));
      connection.onreconnected(() => {
        this.setState("connected");
        void this.invalidateAfterReconnect();
      });
      connection.onclose(() => this.setState("disconnected"));

      this.connection = connection;
      try {
        await connection.start();
        this.setState("connected");
      } catch {
        this.connection = undefined;
        connection.off("productChanged");
        this.setState("disconnected");
      }
    });

    return this.lifecycle;
  }

  stop() {
    this.lifecycle = this.lifecycle.then(async () => {
      const connection = this.connection;
      this.connection = undefined;
      if (connection) {
        connection.off("productChanged");
        await connection.stop();
      }
      this.setState("disconnected");
    });

    return this.lifecycle;
  }

  private invalidateForProduct(productId: number) {
    return Promise.all([
      this.queryClient.invalidateQueries({
        queryKey: productQueryKeys.detail(productId),
      }),
      this.queryClient.invalidateQueries({
        queryKey: productQueryKeys.lists(),
      }),
      this.queryClient.invalidateQueries({
        queryKey: productQueryKeys.stats(),
      }),
    ]);
  }

  private invalidateAfterReconnect() {
    return Promise.all([
      this.queryClient.invalidateQueries({
        queryKey: productQueryKeys.details(),
      }),
      this.queryClient.invalidateQueries({
        queryKey: productQueryKeys.lists(),
      }),
      this.queryClient.invalidateQueries({
        queryKey: productQueryKeys.stats(),
      }),
    ]);
  }

  private setState(nextState: ProductEventsConnectionState) {
    if (this.state === nextState) return;
    this.state = nextState;
    this.listeners.forEach((listener) => listener());
  }
}

export function ProductEventsProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, isRestoring } = useAuth();
  const queryClient = useQueryClient();
  const managerRef = useRef<ProductEventsConnection | undefined>(undefined);
  if (!managerRef.current) {
    managerRef.current = new ProductEventsConnection(queryClient);
  }
  const manager = managerRef.current;
  const connectionState = useSyncExternalStore(
    manager.subscribe,
    manager.getSnapshot,
    manager.getSnapshot,
  );

  useEffect(() => {
    if (isRestoring || !isAuthenticated) {
      void manager.stop();
      return;
    }

    void manager.start(apiBaseUrl, () => browserAuth.getAccessToken());
    return () => {
      void manager.stop();
    };
  }, [isAuthenticated, isRestoring, manager]);

  const value = useMemo(() => connectionState, [connectionState]);
  return (
    <ProductEventsContext.Provider value={value}>
      {children}
    </ProductEventsContext.Provider>
  );
}

export function useProductEventsConnectionState() {
  return useContext(ProductEventsContext);
}
