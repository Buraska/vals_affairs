import Link from 'next/link'
import type { Category, Media as MediaType } from '@/payload-types'
import { locales } from '@/app/lib/localization/i18n'
import { localeLabels } from '@payload-config'
import ShimmerImage from '@/app/components/ShimmerImage'

export function QuickLinks({
  locale,
  categories,
  eventsTitle,
  noCategoriesTitle,
  noCategoriesTryOther,
}: {
  locale: string
  categories: Category[]
  eventsTitle: string
  noCategoriesTitle: string
  noCategoriesTryOther: string
}) {
  const otherLocales = locales.filter((l) => l !== locale)

  return (
    <section id="categories" className="py-12 sm:py-16 px-4 sm:px-8 lg:px-16">
      <div className="mb-8 pb-4 border-b border-[var(--border)]">
        <h2 className="text-2xl font-bold text-[var(--dark)]" style={{ fontFamily: "var(--font-playfair)" }}>
          {eventsTitle}
        </h2>
      </div>
      {categories.length === 0 ? (
        <div className="rounded border border-[var(--border)] bg-[var(--card-bg)] p-8 sm:p-10 text-center">
          <p className="text-lg font-medium text-[var(--dark)] mb-2" style={{ fontFamily: "var(--font-playfair)" }}>
            {noCategoriesTitle}
          </p>
          <p className="text-sm text-[var(--muted)] mb-4">{noCategoriesTryOther}</p>
          <div className="flex flex-wrap justify-center gap-3">
            {otherLocales.map((l) => (
              <Link
                key={l}
                href={`/${l}`}
                className="inline-flex items-center px-4 py-2 rounded border border-[var(--border)] text-sm text-[var(--muted)] hover:border-[var(--dark)] hover:text-[var(--dark)] transition-colors"
              >
                {localeLabels[l] ?? l}
              </Link>
            ))}
          </div>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((item) => (
            <a
              key={item.id}
              href={`/${locale}/category/${item.id}`}
              className="group relative flex flex-col overflow-hidden bg-[var(--card-bg)] border border-[var(--border)] transition hover:bg-[#FFFDF6]"
            >
              {item.image ? (
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-[var(--border)]">
                  <ShimmerImage
                    src={(item.image as MediaType).url ?? ""}
                    alt={(item.image as MediaType).alt ?? ""}
                    fill
                    style={{ objectFit: 'cover' }}
                    sizes="(max-width: 768px) 33vw, 50vw"
                  />
                </div>
              ) : (
                <div className="flex aspect-[4/3] w-full items-center justify-center bg-[var(--border)] text-2xl text-[var(--muted)]" role="img" aria-hidden>
                  →
                </div>
              )}
              <div className="flex flex-col gap-1 p-5">
                <h3 className="font-semibold text-[var(--dark)] group-hover:text-[var(--rust)] transition-colors" style={{ fontFamily: "var(--font-playfair)" }}>
                  {item.title}
                </h3>
                <p className="text-sm text-[var(--muted)] font-light">{item.description ?? ""}</p>
              </div>
              <span className="absolute bottom-5 right-5 w-8 h-8 rounded-full border border-[var(--border)] flex items-center justify-center group-hover:bg-[var(--dark)] group-hover:border-[var(--dark)] transition-colors">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="group-hover:[&_path]:stroke-[var(--cream)]">
                  <path d="M2 7H12M8 3L12 7L8 11" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            </a>
          ))}
        </div>
      )}
    </section>
  );
}
