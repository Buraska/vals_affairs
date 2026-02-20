'use client'

import { useState, useMemo } from 'react'
import Lightbox from 'yet-another-react-lightbox'
import 'yet-another-react-lightbox/styles.css'
import { Media } from '@/app/components/Media'
import { Media as MediaType } from '@/payload-types'
import { getMediaUrl } from '@/utilities/getMediaUrl'
import { useLanguage } from '@/app/contexts/LanguageContext'

type LightboxSlide = {
  src: string
  alt?: string
  width?: number
  height?: number
  srcSet?: { src: string; width: number; height: number }[]
}

type AffairImageCarouselProps = {
  slides: MediaType[]
  /** First slide media resource for the cover image (Next Image with fill) */
  coverResource?: MediaType
  title?: string
}

export function AffairImageCarousel({
  slides,
  coverResource,
  title,
}: AffairImageCarouselProps) {
  const { t } = useLanguage()
  const [open, setOpen] = useState(false)
  const [index, setIndex] = useState(0)

  const lightboxSlides = slides.map((s) => ({
    src: s.url ?? "",
    alt: s.alt ?? "",
    width: s.width ?? 0,
    height: s.height ?? 0,
    srcSet: s.sizes ? Object.entries(s.sizes).map((size) => {
      return {
        src: size[1].url ?? "",
        width: size[1].width ?? 0,
        height: size[1].height ?? 0
      }
    }) : []
  }))


  if (slides.length === 0 && !coverResource) {
    return (
      <div className="mb-4 flex aspect-[16/10] w-full items-center justify-center rounded-lg bg-amber-100 text-4xl text-amber-300">
        —
      </div>
    )
  }

  const hasMultiple = slides.length > 1
  const showCover = coverResource && (coverResource.url || lightboxSlides[0]?.src)

  return (
    <>

      <div className="flex flex-col-reverse">

        {hasMultiple && (
          <div className=" flex-col flex-nowrap gap-2 overflow-x-auto pb-2" role="list" aria-label="Миниатюры фото">
            {slides.map((media, i) => (
              <button
                key={media.id}
                type="button"
                role="listitem"
                className="relative h-16 w-24 shrink-0 overflow-hidden rounded-sm border-2 border-amber-200 transition-colors hover:border-amber-500 focus:border-amber-600 focus:outline-none"
                onClick={(e) => {
                  e.stopPropagation()
                  setIndex(i)
                  setOpen(true)
                }}
                aria-label={`${i + 1} / ${slides.length}. ${t.common.openGallery}`}
              >
                <img
                  src={media.thumbnailURL ?? getMediaUrl(media.sizes?.thumbnail?.url ?? media.url, media.updatedAt) ?? ''}
                  alt={media.alt ?? title ?? `Фото ${i + 1}`}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              </button>
            ))}
          </div>
        )}

        <div
          className={`relative mb-4 w-full overflow-hidden rounded-lg bg-amber-100 ${hasMultiple || slides.length === 1 ? 'cursor-pointer' : ''}`}
          style={{ aspectRatio: '16/10' }}
          onClick={() => {
            if (lightboxSlides.length > 0) {
              setIndex(0)
              setOpen(true)
            }
          }}
          onKeyDown={(e) => {
            if (lightboxSlides.length > 0 && (e.key === 'Enter' || e.key === ' ')) {
              e.preventDefault()
              setIndex(0)
              setOpen(true)
            }
          }}
          role={lightboxSlides.length > 0 ? 'button' : undefined}
          tabIndex={lightboxSlides.length > 0 ? 0 : undefined}
          aria-label={title ? `${t.common.openGallery}: ${title}` : t.common.openGallery}
        >

          {showCover ? (
            <Media
              resource={coverResource}
              pictureClassName="relative size-full block"
              imgClassName="object-cover object-center"
              size="1200px"
            />
          ) : lightboxSlides[0] ? (
            <img
              src={lightboxSlides[0].src}
              alt={slides[0].alt ?? title ?? ''}
              className="h-full w-full object-cover object-center"
            />
          ) : (
            <div className="flex aspect-[16/10] w-full items-center justify-center text-4xl text-amber-300">
              —
            </div>
          )}
          {hasMultiple && (
            <div className="absolute bottom-3 right-3 rounded-sm bg-black/50 px-2 py-1 text-xs font-medium text-white">
              {slides.length} {t.common.photoCount}
            </div>
          )}
        </div>
      </div>


      <Lightbox
        open={open}
        close={() => setOpen(false)}
        index={index}
        slides={lightboxSlides}
        on={{
          view: ({ index: i }) => setIndex(i),
        }}
      />
    </>
  )
}
