import type { Affair } from "@/payload-types";
import Link from "next/link";
import { Locale } from "../lib/localization/i18n";
import { getTranslations } from "../lib/localization/translations";
import { AffairCarousel } from "./AffairCarousel";

export default function CategoryPreview({
  title,
  affairs,
  categorySlug,
  locale,
}: {
  title: string;
  affairs: Affair[];
  categorySlug: string;
  locale: Locale;
}) {
  const t = getTranslations(locale);

  const sorted = [...affairs]
    .filter((a) => a["start date"] != null)
    .sort(
      (a, b) =>
        new Date(a["start date"]).getTime() - new Date(b["start date"]).getTime()
    )
    .slice(0, 6);

  if (sorted.length === 0) return null;

  return (
    <section className="px-4 py-12 sm:px-8 sm:py-14 lg:px-16">
      <div className="mx-auto max-w-7xl">
        <div className="mb-7 border-b border-[var(--border)] pb-4">
          <h2
            className="text-2xl font-bold text-[var(--dark)] sm:text-3xl"
            style={{ fontFamily: "var(--font-playfair)" }}
          >
            {title}
          </h2>
        </div>

        <AffairCarousel affairs={sorted} locale={locale} />

        <div className="mt-10 flex justify-center">
          <Link
            href={`/${locale}/category/${categorySlug}`}
            className="inline-flex items-center gap-2 rounded-full border border-[var(--dark)]/40 bg-[var(--dark)]/5 px-8 py-3.5 text-sm font-bold uppercase tracking-wide text-[var(--dark)] transition hover:bg-[var(--dark)] hover:text-[var(--cream)]"
          >
            {t.common.showMore}
            <svg width="16" height="16" viewBox="0 0 14 14" fill="none">
              <path d="M2 7H12M8 3L12 7L8 11" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
