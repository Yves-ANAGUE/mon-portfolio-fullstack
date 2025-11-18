import i18n from "i18next";
import { initReactI18next } from "react-i18next";

// ✅ Import des fichiers JSON avec la syntaxe ESM
import translationFR from "../public/locales/fr/translation.json";
import translationEN from "../public/locales/en/translation.json";

// ✅ Initialisation d'i18next
i18n
  .use(initReactI18next)
  .init({
    resources: {
      fr: { translation: translationFR },
      en: { translation: translationEN },
    },
    lng: localStorage.getItem("language") || "fr",
    fallbackLng: "fr",
    interpolation: {
      escapeValue: false, // React se charge déjà d'échapper le HTML
    },
  });

export default i18n;
