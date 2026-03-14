"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import type { Lang, TranslationsSchema } from "@/app/lib/localization/translations";
import { translations } from "@/app/lib/localization/translations";
import { defaultLocale } from "@/app/lib/localization/i18n";

const LanguageContext = createContext<{
  t: TranslationsSchema;
  lang: Lang;
  siteDescription: string | null;
} | null>(null);

export function LanguageProvider({
  children,
  initialLocale,
  initialSiteDescription = null,
}: {
  children: React.ReactNode;
  initialLocale: Lang;
  initialSiteDescription?: string | null;
}) {
  const t = translations[initialLocale];
  const lang = initialLocale ?? defaultLocale
  const siteDescription = initialSiteDescription ?? null;

  return (
    <LanguageContext.Provider value={{t, lang, siteDescription }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}
