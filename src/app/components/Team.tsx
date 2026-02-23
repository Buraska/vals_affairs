"use client";

import { useLanguage } from "@/app/contexts/LanguageContext";
import { Media } from "@/app/components/Media";
import type { Team as TeamMember } from "@/payload-types";
import { defaultLocale, type Locale } from "@/app/lib/localization/i18n";


function getDescriptionForLocale(
  description: TeamMember["description"],
  locale: Locale
): string {
  if (!description) return "";
  const loc = locale in description ? description[locale as keyof typeof description] : null;
  return (loc ?? description[defaultLocale] ?? "") as string;
}

export function Team({
  members,
  locale,
}: {
  members: TeamMember[];
  locale: Locale;
}) {
  const { t } = useLanguage();
  const hasMembers = members.length > 0;

  return (
    <section id='about' className="border-t bg-amber-50 border-amber-100 py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-center text-2xl font-bold text-stone-800 sm:text-3xl">
          {t.contact.team}
        </h2>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {hasMembers &&
            members.map((person) => {
              const photo =
                typeof person.photo === "object" && person.photo != null
                  ? person.photo
                  : null;
              const roleText = getDescriptionForLocale(person.description, locale);

              return (
                <div
                  key={person.id}
                  className="rounded-xl border border-stone-100 bg-stone-50/50 p-5 transition hover:border-amber-200 hover:shadow-md"
                >
                  {photo && (
                    <div className="mb-3 aspect-square overflow-hidden rounded-lg bg-stone-100">
                      <Media
                        resource={photo}
                        size="400px"
                        imgClassName="h-full w-full object-cover"
                      />
                    </div>
                  )}
                  <h3 className="font-semibold text-amber-900">{person.name}</h3>
                  {roleText && (
                    <p className="mt-1 text-sm text-stone-600">{roleText}</p>
                  )}
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
              );
            })}
        </div>
      </div>
    </section>
  );
}
