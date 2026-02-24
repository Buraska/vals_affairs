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
    <section id="about" className="border-t border-[var(--border)] bg-[var(--card-bg)] py-16 sm:py-20 px-4 sm:px-8 lg:px-16">
      <div className="mb-10 pb-4 border-b border-[var(--border)]">
        <h2 className="text-2xl font-bold text-[var(--dark)]" style={{ fontFamily: "var(--font-playfair)" }}>
          {t.contact.team}
        </h2>
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
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
                className="border border-[var(--border)] bg-[var(--cream)] p-5 transition hover:border-[var(--warm)]"
              >
                {photo && (
                  <div className="mb-4 aspect-square overflow-hidden bg-[var(--border)]">
                    <Media
                      resource={photo}
                      size="400px"
                      imgClassName="h-full w-full object-cover"
                    />
                  </div>
                )}
                <h3 className="font-semibold text-[var(--dark)]" style={{ fontFamily: "var(--font-playfair)" }}>
                  {person.name}
                </h3>
                {roleText && (
                  <p className="mt-1 text-sm text-[var(--muted)] font-light">{roleText}</p>
                )}
                {person.phone && (
                  <a
                    href={`tel:${person.phone.replace(/\s/g, "")}`}
                    className="mt-2 block text-sm text-[var(--rust)] hover:underline"
                  >
                    {person.phone}
                  </a>
                )}
                {person.email && (
                  <a
                    href={`mailto:${person.email}`}
                    className="mt-0.5 block text-sm text-[var(--rust)] hover:underline"
                  >
                    {person.email}
                  </a>
                )}
              </div>
            );
          })}
      </div>
    </section>
  );
}
