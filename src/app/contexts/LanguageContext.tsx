"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import type { Lang, TranslationsSchema } from "@/app/lib/localization/translations";
import { translations } from "@/app/lib/localization/translations";
import { defaultLocale } from "@/app/lib/localization/i18n";

const LanguageContext = createContext<{
  lang: Lang;
  setLang: (l: Lang) => void;
  t: TranslationsSchema;
} | null>(null);

export function LanguageProvider({
  children,
  initialLocale,
}: {
  children: React.ReactNode;
  initialLocale: Lang;
}) {
  const [lang, setLangState] = useState<Lang>(initialLocale);
  const setLang = useCallback((l: Lang) => setLangState(l), []);
  const t = translations[lang];

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}
