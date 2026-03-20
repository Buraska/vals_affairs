'use client'

import { useState } from 'react'
import Image from 'next/image'
import Lightbox, { SlideImage } from 'yet-another-react-lightbox'
import 'yet-another-react-lightbox/styles.css'
import ShimmerImage from '@/app/components/ShimmerImage'
import { useLanguage } from '@/app/contexts/LanguageContext'
import type { Media as MediaType } from '@/payload-types'

function LightboxSlide({ slide }: { slide: SlideImage }) {
  return (
    <Image
      src={slide.src ?? ''}
      alt={slide.alt ?? ''}
      fill
      style={{ objectFit: 'contain' }}
      quality={25}
    />
  )
}

type AffairImageCarouselProps = {
  slides: MediaType[]
  title?: string
}

export function AffairImageCarousel({
  slides,
  title,
}: AffairImageCarouselProps) {
  const { t } = useLanguage()
  const [open, setOpen] = useState(false)
  const [index, setIndex] = useState(0)
  const lightboxSlides: SlideImage[] = slides.map((s) => ({
    src: s.url ?? '',
    alt: s.alt ?? '',
    width: s.width ?? 0,
    height: s.height ?? 0,
    // NB! SrcSet not actual with Next.Image
    // srcSet: s.sizes ? 
    // Object.entries(s.sizes)
    //     .map((size) => {
    //       const value = size[1]
    //       if (value?.url?.trim()) {
    //         return {
    //           src: value.url,
    //           width: value.width ?? 0,
    //           height: value.height ?? 0,
    //         }
    //       }
    //       return null
    //     })
    //     .filter((x): x is { src: string; width: number; height: number } => x != null)
    //   : []
  }))

  if (slides.length === 0) {
    return (
      <div className="mb-4 flex aspect-[16/10] w-full items-center justify-center rounded-lg bg-amber-100 text-4xl text-amber-300">
        —
      </div>
    )
  }
  const hasMultiple = slides.length > 1
  const coverResource =  slides[0]

  return (
    <>
      <div className="flex flex-col-reverse">
        {hasMultiple && (
          <div className="flex flex-row flex-nowrap gap-2 overflow-x-auto pb-2" role="list" aria-label="Gallery thumbnails">
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
                <span className="relative block size-full">
                  <ShimmerImage
                    src={media.thumbnailURL ?? ''}
                    alt={media.alt ?? `Photo ${i}`}
                    fill
                    style={{ objectFit: 'cover' }}
                    sizes="80px"
                  />
                </span>
              </button>
            ))}
          </div>
        )}

        <button
          type="button"
          disabled={lightboxSlides.length === 0}
          className="relative mb-4 w-full aspect-[16/10] overflow-hidden rounded-lg bg-amber-100 cursor-pointer"
          onClick={() => {
            if (lightboxSlides.length > 0) {
              setIndex(0)
              setOpen(true)
            }
          }}
          aria-label={title ? `${t.common.openGallery}: ${title}` : t.common.openGallery}
        >

          {coverResource ? (
            <span className="relative block size-full">
              <ShimmerImage
                src={coverResource.url ?? ''}
                alt={coverResource.alt ?? title ?? ''}
                fill
                style={{ objectFit: 'cover' }}
              />
            </span>
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
        </button>
      </div>


      <Lightbox
        open={open}
        close={() => setOpen(false)}
        index={index}
        slides={lightboxSlides}
        render={{ slide: ({ slide }) => <LightboxSlide slide={slide} /> }}
        carousel={{ imageFit: 'contain' }}
        on={{ view: ({ index: i }) => setIndex(i) }}
      />
    </>
  )
}
