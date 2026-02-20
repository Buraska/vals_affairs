"use client";

import { useLanguage } from "@/app/contexts/LanguageContext";

const team = [
  { name: "Gulnara Vals", role: "Директор", phone: "+372 55555555", email: "gulnarar@mail.ee" },
  { name: "Vadim Zolotarenko", role: "Всё остальное", phone: "+372 55555555", email: "vadim@mail.ee" },
];

export function Team() {
  const { t } = useLanguage();

  return (
    <section className="border-t border-amber-100 bg-white py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-center text-2xl font-bold text-stone-800 sm:text-3xl">
          {t.contact.team}
        </h2>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {team.map((person) => (
            <div
              key={person.name}
              className="rounded-xl border border-stone-100 bg-stone-50/50 p-5 transition hover:border-amber-200 hover:shadow-md"
            >
              <h3 className="font-semibold text-amber-900">{person.name}</h3>
              <p className="mt-1 text-sm text-stone-600">{person.role}</p>
              {person.phone && (
                <a
                  href={`tel:${person.phone.replace(/\s/g, "")}`}
                  className="mt-2 block text-sm text-amber-700 hover:underline"
                >
                  {person.phone}
                </a>
              )}
              {person.email && (
                <a
                  href={`mailto:${person.email}`}
                  className="mt-0.5 block text-sm text-amber-700 hover:underline"
                >
                  {person.email}
                </a>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
