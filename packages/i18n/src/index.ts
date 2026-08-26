import type { InitOptions } from "i18next";
import { common as enCommon } from "./locales/en/common.js";
import { mobile as enMobile } from "./locales/en/mobile.js";
import { web as enWeb } from "./locales/en/web.js";
import { common as trCommon } from "./locales/tr/common.js";
import { mobile as trMobile } from "./locales/tr/mobile.js";
import { web as trWeb } from "./locales/tr/web.js";

export const defaultLanguage = "tr";
export const fallbackLanguage = "en";
export const namespaces = ["common", "web", "mobile"] as const;

export const resources = {
  tr: { common: trCommon, web: trWeb, mobile: trMobile },
  en: { common: enCommon, web: enWeb, mobile: enMobile }
} as const;

export const i18nOptions: InitOptions = {
  lng: defaultLanguage,
  fallbackLng: fallbackLanguage,
  defaultNS: "common",
  ns: namespaces,
  resources
};
