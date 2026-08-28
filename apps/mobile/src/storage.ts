import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const volatileWebStorage = new Map<string, string>();

export const appStorage = {
  async getItem(key: string): Promise<string | null> {
    if (Platform.OS === "web") {
      try {
        return localStorage.getItem(key);
      } catch {
        return volatileWebStorage.get(key) ?? null;
      }
    }

    return SecureStore.getItemAsync(key);
  },

  async setItem(key: string, value: string): Promise<void> {
    if (Platform.OS === "web") {
      try {
        localStorage.setItem(key, value);
      } catch {
        volatileWebStorage.set(key, value);
      }
      return;
    }

    await SecureStore.setItemAsync(key, value);
  },

  async removeItem(key: string): Promise<void> {
    if (Platform.OS === "web") {
      try {
        localStorage.removeItem(key);
      } catch {
        volatileWebStorage.delete(key);
      }
      return;
    }

    await SecureStore.deleteItemAsync(key);
  },
};
