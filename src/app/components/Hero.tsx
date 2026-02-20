"use client";

import { useLanguage } from "@/app/contexts/LanguageContext";

const stats = [
  { key: "schoolTours" as const, value: 3047 },
  { key: "familyTrips" as const, value: 1261 },
  { key: "celebrations" as const, value: 262 },
  { key: "campSessions" as const, value: 119 },
];

export function Hero() {
  const { t } = useLanguage();

  return (
    <section className="relative overflow-hidden ">
      <div className="absolute" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        <div className="mt-14 sm:mt-18">
          <h2 className="text-center text-xl font-semibold text-stone-800 sm:text-2xl">
            {t.hero.statsTitle}
          </h2>
          <div className="mt-8 grid grid-cols-2 gap-6 sm:grid-cols-4 sm:gap-8">
            {stats.map(({ key, value }) => (
              <div
                key={key}
                className="rounded-2xl border border-amber-100 bg-white/80 p-6 text-center shadow-sm backdrop-blur sm:p-8"
              >
                <div className="text-3xl font-bold tabular-nums text-amber-700 sm:text-4xl">
                  {value.toLocaleString()}
                </div>
                <div className="mt-2 text-xs font-medium uppercase tracking-wider text-stone-500 sm:text-sm">
                  {t.hero[key]}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
