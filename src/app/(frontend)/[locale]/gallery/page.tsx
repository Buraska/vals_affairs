import Link from 'next/link'
import Image from 'next/image'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { getTranslations } from '@/app/lib/localization/translations'
import type { Lang } from '@/app/lib/localization/translations'
import { isValidLocale, type Locale, locales } from '@/app/lib/localization/i18n'
import { getServerSideURL } from '@/utilities/getURL'
import { Gallery, Media } from '@/payload-types'
import ShimmerImage from '@/app/components/ShimmerImage'

const payload = await getPayload({ config: configPromise })

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}


export default async function GalleryPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const lang = (isValidLocale(locale) ? locale : 'ee') as Locale
  const t = getTranslations(lang as Lang)

  const { docs } = await payload.find({
    collection: 'gallery',
    depth: 2,
    locale: lang,
    fallbackLocale: 'ee',
    limit: 200,
    sort: '-updatedAt',
  })

  const galleries = docs as unknown as Gallery[]

  return (
    <main className="min-h-screen">
      <div className="mx-auto  px-4 py-10 sm:px-8 lg:px-16">
        <div className="mb-6 flex items-end gap-4 border-b border-[var(--border)] pb-4">
          <h1
            className="text-2xl font-bold text-[var(--dark)]"
            style={{ fontFamily: 'var(--font-playfair)' }}
          >
            {t.common.galleryPageTitle}
          </h1>
        </div>

        <div className="space-y-6">
          {galleries.map((g) => {
            const driveLink = g.driveLink ?? ''
            const title = g.title ?? ''

            const photos = (g.photos ?? []).filter((x) => {
              const p = x?.photo
              return typeof p !== 'string' && p != null && typeof p === 'object' && 'url' in p
            })



            return (
              <section key={g.id} className="space-y-3">
                {title && (
                  <div className="mb-6 flex items-end gap-4 border-b border-[var(--border)] pb-4">
                    <h3 className="text-lg font-semibold text-[var(--dark)]">
                      {title}
                  </h3>    
                  </div>

                )}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {photos.map((p, idx) => {
                    const photo = p?.photo as Media
                    if (!photo.url) return null

                    const alt = photo?.alt ?? ''

                    return (
                      <div
                        key={p?.id ?? `${g.id}-${idx}`}
                        className="relative  w-full shrink-0 overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--card-bg)] aspect-[4/3] "
                        title={alt}
                      >
                        <ShimmerImage
                          src={photo.url}
                          alt={alt}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )
                  })}

                  <Link
                    href={driveLink || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-disabled={!driveLink}
                    className={[
                      'flex w-full  aspect-[4/3] shrink-0 items-center justify-center rounded-lg border border-orange-400/70 bg-orange-200 text-2xl font-bold  transition ',
                      driveLink ? 'hover:bg-orange-300' : 'pointer-events-none opacity-60',
                    ].join(' ')}
                    title={driveLink ? driveLink : undefined}
                  >
                    {t.common.showMore}
                  </Link>
                </div>
              </section>
            )
          })}

          {galleries.length === 0 && (
            <p className="text-[var(--muted)]">{t.common.contentNotAdded}</p>
          )}
        </div>
      </div>
    </main>
  )
}

