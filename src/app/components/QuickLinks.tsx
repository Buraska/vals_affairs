import Link from 'next/link'
import type { AboutUs, Category, GalleryInfo, Media as MediaType } from '@/payload-types'
import { locales } from '@/app/lib/localization/i18n'
import { localeLabels } from '@payload-config'
import ShimmerImage from '@/app/components/ShimmerImage'

function QuickLinkCard({
  href,
  image,
  title,
  description,
  className,
  textClassName,
}: {
  href: string
  image?: string | MediaType | null
  title: string
  description?: string
  className?: string
  textClassName?: string
}) {
  return (
    <a
      href={href}
      className={`${className} group relative flex flex-col overflow-hidden bg-[var(--card-bg)] border border-[var(--border)] transition hover:bg-[#FFFDF6]`}
    >
      {image && typeof image !== 'string' ? (
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-[var(--border)]">
          <ShimmerImage
            src={(image as MediaType).url ?? ''}
            alt={(image as MediaType).alt ?? ''}
            fill
            style={{ objectFit: 'cover' }}
          />
        </div>
      ) : (
        <div
          className="flex aspect-[4/3] w-full items-center justify-center bg-[var(--border)] text-2xl text-[var(--muted)]"
          role="img"
          aria-hidden
        >
          →
        </div>
      )}

      <div className="flex flex-col gap-1 p-5">
        <h3
          className={` font-semibold text-[var(--dark)] group-hover:text-[var(--rust)] transition-colors`}
          style={{ fontFamily: 'var(--font-playfair)' }}
        >
          {title}
        </h3>
        {description ? (
          <p className={`text-sm font-light text-[var(--muted)] ${textClassName}`}>{description}</p>
        ) : null}
      </div>

      <span className="absolute bottom-5 right-5 w-8 h-8 rounded-full border border-[var(--border)] flex items-center justify-center group-hover:bg-[var(--dark)] group-hover:border-[var(--dark)] transition-colors">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="group-hover:[&_path]:stroke-[var(--cream)]">
          <path d="M2 7H12M8 3L12 7L8 11" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
    </a>
  )
}

export function QuickLinks({
  locale,
  categories,
  galleryInfo,
  aboutUs,
  eventsTitle,
  noCategoriesTitle,
  noCategoriesTryOther,
}: {
  locale: string
  categories: Category[]
  galleryInfo?: GalleryInfo | null
  aboutUs?: AboutUs | null
  eventsTitle: string
  noCategoriesTitle: string
  noCategoriesTryOther: string
}) {
  const otherLocales = locales.filter((l) => l !== locale)
  const galleryTitle =
    galleryInfo?.name?.[locale as keyof NonNullable<GalleryInfo['name']>] ??
    galleryInfo?.name?.ee ??
    galleryInfo?.name?.en ??
    ''
  const galleryDescription =
    galleryInfo?.description?.[locale as keyof NonNullable<GalleryInfo['description']>] ??
    galleryInfo?.description?.ee ??
    galleryInfo?.description?.en ??
    ''

  const aboutTitle =
    aboutUs?.name?.[locale as keyof NonNullable<AboutUs['name']>] ??
    aboutUs?.name?.ee ??
    aboutUs?.name?.en ??
    ''
  const aboutDescription =
    aboutUs?.description?.[locale as keyof NonNullable<AboutUs['description']>] ??
    aboutUs?.description?.ee ??
    aboutUs?.description?.en ??
    ''

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
          {galleryInfo && (
            <QuickLinkCard
              href={`/${locale}/gallery`}
              image={galleryInfo.photo as unknown as MediaType}
              title={galleryTitle}
              description={galleryDescription}
              className='bg-[var(--warm)]'
              textClassName='text-white group-hover:text-gray-400'
            />
          )}
          {categories.map((item) => (
            <QuickLinkCard
              key={item.id}
              href={`/${locale}/category/${item.id}`}
              image={item.image as unknown as MediaType}
              title={item.title ?? ''}
              description={item.description ?? ''}
            />
          ))}

          {aboutUs && (
            <QuickLinkCard
              href={`/${locale}/about`}
              image={aboutUs.photo as unknown as MediaType}
              title={aboutTitle}
              description={aboutDescription}
              className='bg-[var(--warm)]'
              textClassName='text-white group-hover:text-gray-400'
            />
          )}
        </div>
      )}
    </section>
  );
}
