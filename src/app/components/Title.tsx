"use client";

import { useLanguage } from "@/app/contexts/LanguageContext";

export function Title() {
  const { t, siteDescription } = useLanguage();

  return (
    <section className="relative overflow-hidden border-b border-[var(--border)] lg:min-h-28rem flex flex-col justify-center px-4 sm:px-8 lg:px-16 py-12 sm:py-16 ">
      {/* Градиент в стиле заката — оранжевые и тёплые тона */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(ellipse 90% 70% at 50% 80%, rgba(255, 132, 159, 0.25) 0%, rgba(230, 154, 123, 0.12) 40%, transparent 70%),
            radial-gradient(ellipse 70% 50% at 75% 30%, rgba(255, 165, 80, 0.2) 0%, transparent 50%),
            radial-gradient(ellipse 60% 40% at 20% 50%, rgba(255, 255, 255, 0.15) 0%, transparent 45%),
            linear-gradient(180deg,rgb(170, 126, 91) 0%,rgb(200, 155, 115) 50%,rgb(255, 184, 136) 100%)
          `,
        }}
      />
      {/* Клетчатый паттерн */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            repeating-linear-gradient(0deg, transparent, transparent 59px, rgba(255, 255, 255, 0.39) 59px, rgba(255,160,80,0.06) 60px),
            repeating-linear-gradient(90deg, transparent, transparent 59px, rgba(255, 159, 80, 0.51) 59px, rgba(255,160,80,0.06) 60px)
          `,
        }}
      />
      <p className="relative z-10 mx-auto max-w-[55ch] text-pretty text-center text-lg sm:text-xl lg:text-2xl font-medium leading-relaxed tracking-[-0.01em] text-[var(--cream)] drop-shadow-[0_1px_2px_rgba(0,0,0,0.35)]">
        {siteDescription}
      </p>
    </section>
  );
}
