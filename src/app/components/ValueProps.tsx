"use client";

import { useLanguage } from "@/app/contexts/LanguageContext";

const items = [
  {
    key: "variety" as const,
    subKey: "varietyDesc" as const,
    icon: "✨",
  },
  {
    key: "newRoutes" as const,
    subKey: null,
    icon: "🗺️",
  },
  {
    key: "savings" as const,
    subKey: "savingsDesc" as const,
    icon: "💰",
  },
  {
    key: "quality" as const,
    subKey: "qualityDesc" as const,
    icon: "⭐",
  },
];

export function ValueProps() {
  const { t } = useLanguage();

  return (
    <section className="border-amber-100 bg-white py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-center text-2xl font-bold text-stone-800 sm:text-3xl">
          {t.value.title}
        </h2>
        <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {items.map(({ key, subKey, icon }) => (
            <div
              key={key}
              className="rounded-2xl border border-amber-50 bg-amber-50/30 p-6 text-center transition hover:border-amber-200 hover:bg-amber-50/50"
            >
              <span className="text-3xl" role="img" aria-hidden>
                {icon}
              </span>
              <h3 className="mt-3 font-semibold text-amber-900">{t.value[key]}</h3>
              {subKey && (
                <p className="mt-1 text-sm text-stone-600">{t.value[subKey]}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
