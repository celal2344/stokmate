import { defaultLanguage, fallbackLanguage, resources } from "@stokmate/i18n";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const languageStorageKey = "stokmate.web.language";
const savedLanguage = window.localStorage.getItem(languageStorageKey);
const initialLanguage = savedLanguage === "en" ? "en" : defaultLanguage;

void i18n.use(initReactI18next).init({
  resources,
  lng: initialLanguage,
  fallbackLng: fallbackLanguage,
  defaultNS: "web",
  interpolation: { escapeValue: false },
});

document.documentElement.lang = initialLanguage;

i18n.on("languageChanged", (language) => {
  window.localStorage.setItem(languageStorageKey, language);
  document.documentElement.lang = language;
});

export { i18n };
