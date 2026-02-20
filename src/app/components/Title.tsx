"use client";

import { useLanguage } from "@/app/contexts/LanguageContext";

export function Title() {
  const { t } = useLanguage();
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-amber-50 to-white py-16 sm:py-24">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(172, 92, 0, 0.15),transparent)]" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-amber-900 sm:text-4xl md:text-5xl">
            Vals
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-stone-600">
            {t.meta.tagline}
          </p>
        </div>
      </div>
    </section>
  );
}
