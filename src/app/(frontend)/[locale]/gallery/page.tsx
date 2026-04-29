import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { getTranslations } from '@/app/lib/localization/translations'
import type { Lang } from '@/app/lib/localization/translations'
import { isValidLocale, type Locale, locales } from '@/app/lib/localization/i18n'
import { Gallery, Media } from '@/payload-types'
import YouTubePreview from '@/app/components/YouTubePreview'
import SmartImage from '@/app/components/SmartImage'
import SectionImageReveal from '@/app/components/SectionImageReveal'
import { pickMediaSize } from '@/utilities/pickMediaSize'

const payload = await getPayload({ config: configPromise })

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}


const formatGalleryDate = (value: string | null | undefined, locale: Locale) => {
  if (!value) return ''
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleDateString('et-EE', {
    day: '2-digit',
    month: 'numeric',
    year: 'numeric',
  })
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
    sort: '-date',
  })

  const galleries = docs as unknown as Gallery[]

  return (
    <main className="min-h-screen">
      <div className="mx-auto max-w-[1600px] px-4 py-12 sm:px-8 lg:px-16">
        <header className="mb-12 text-center">
          <h1
            className="text-4xl font-bold text-[var(--dark)] sm:text-5xl lg:text-6xl"
            style={{ fontFamily: 'var(--font-playfair)' }}
          >
            {t.common.galleryPageTitle}
          </h1>
          <div className="mx-auto mt-6 h-px w-24 bg-gradient-to-r from-transparent via-[var(--warm)] to-transparent" />
        </header>

        <div className="space-y-20">
          {galleries.map((g) => {
            const title = g.title ?? ''
            const formattedDate = formatGalleryDate(g.date, lang)

            const photos = (g.photos ?? []).filter((x) => {
              const p = x?.photo
              return typeof p !== 'string' && p != null && typeof p === 'object' && 'url' in p
            })

            const videos = (g.videos ?? []).filter((v) => !!v?.youtubeUrl)

            if (photos.length === 0 && videos.length === 0) return null

            const totalItems = photos.length + videos.length

            return (
              <section key={g.id} className="space-y-6">
                <div className="flex flex-wrap items-baseline gap-x-4 gap-y-2">
                  {title && (
                    <h2
                      className="text-2xl font-semibold text-[var(--dark)] sm:text-3xl"
                      style={{ fontFamily: 'var(--font-playfair)' }}
                    >
                      {title}
                    </h2>
                  )}
                  {formattedDate && (
                    <span className="text-sm font-medium text-[var(--warm)] sm:text-base">
                      {formattedDate}
                    </span>
                  )}
                  <div className="h-px flex-1 bg-[var(--border)]" />
                  <span className="text-xs font-medium uppercase tracking-widest text-[var(--muted)]">
                    {totalItems} {totalItems === 1 ? 'item' : 'items'}
                  </span>
                </div>

                {/* Masonry layout: respects each image's natural aspect ratio.
                    SectionImageReveal keeps the grid hidden until every photo has
                    finished loading (or a 5s timeout fires). */}
                <SectionImageReveal count={photos.length}>
                  <div className="columns-1 gap-4 sm:columns-2 lg:columns-3 xl:columns-4 [&>*]:mb-4">
                    {photos.map((p, idx) => {
                      const photo = p?.photo as Media
                      const picked = pickMediaSize(photo, 'large')
                      if (!picked.url) return null

                      const alt = photo?.alt ?? title ?? ''

                      return (
                        <figure
                          key={p?.id ?? `${g.id}-photo-${idx}`}
                          className="group relative block w-full break-inside-avoid overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--card-bg)] shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                        >
                          <SmartImage
                            src={picked.url}
                            width={picked.width || photo.width || 1200}
                            height={picked.height || photo.height || 800}
                            alt={alt}
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                            className="h-auto w-full object-contain transition-transform duration-500 group-hover:scale-[1.02]"
                          />
                        </figure>
                      )
                    })}

                    {videos.map((v, idx) => (
                      <YouTubePreview
                        key={v?.id ?? `${g.id}-video-${idx}`}
                        url={v.youtubeUrl}
                        title={title}
                      />
                    ))}
                  </div>
                </SectionImageReveal>
              </section>
            )
          })}

          {galleries.length === 0 && (
            <p className="py-20 text-center text-[var(--muted)]">{t.common.contentNotAdded}</p>
          )}
        </div>
      </div>
    </main>
  )
}
