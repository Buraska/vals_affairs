"use client";

import { useLanguage } from "@/app/contexts/LanguageContext";
import ShimmerImage from "@/app/components/ShimmerImage";
import type { Team } from "@/payload-types";
import { defaultLocale, type Locale } from "@/app/lib/localization/i18n";

type TeamMember = NonNullable<Team["members"]>[number];

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
    <section id="about" className="relative overflow-hidden border-t border-[var(--border)] py-16 sm:py-20 px-4 sm:px-8 lg:px-16" style={{ background: "var(--dark)" }}>
      {/* Тот же градиент, что и в Title */}
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
      <div
        className="absolute inset-0 pointer-events-none"
      />
      <div className="relative z-10 mb-10 pb-4 border-b border-[var(--cream)]/30">
        <h2 className="text-2xl font-bold text-[var(--cream)]" style={{ fontFamily: "var(--font-playfair)" }}>
          {t.contact.team}
        </h2>
      </div>
      <div className="relative z-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {hasMembers &&
          members.map((person, index) => {
            const photo =
              typeof person.photo === "object" && person.photo != null
                ? person.photo
                : null;
            const roleText = getDescriptionForLocale(person.description, locale);

            return (
              <div
                key={person.id ?? `member-${index}`}
                className="border border-[var(--border)] bg-[var(--cream)] p-5 transition hover:border-[var(--warm)]"
              >
                {photo && (
                  <div className="relative mb-4 aspect-square overflow-hidden bg-[var(--border)]">
                    <ShimmerImage
                      src={photo.url ?? ""}
                      alt={photo.alt ?? ""}
                      fill
                      style={{ objectFit: "cover" }}
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
