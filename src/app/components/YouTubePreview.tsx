'use client'

import Image from 'next/image'
import { useState } from 'react'

type Props = {
  url: string
  title?: string
}

const extractYouTubeId = (url: string): string | null => {
  if (!url) return null
  const patterns = [
    /youtube\.com\/watch\?v=([\w-]{11})/,
    /youtu\.be\/([\w-]{11})/,
    /youtube\.com\/shorts\/([\w-]{11})/,
    /youtube\.com\/embed\/([\w-]{11})/,
  ]
  for (const re of patterns) {
    const m = url.match(re)
    if (m?.[1]) return m[1]
  }
  return null
}

export default function YouTubePreview({ url, title }: Props) {
  const [playing, setPlaying] = useState(false)
  const id = extractYouTubeId(url)

  if (!id) return null

  const thumbnail = `https://i.ytimg.com/vi/${id}/hqdefault.jpg`
  const embedUrl = `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`
  const label = title ? `Play video: ${title}` : 'Play video'

  return (
    <div className="group relative block w-full break-inside-avoid overflow-hidden rounded-xl border border-[var(--border)] bg-black shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
      {playing ? (
        <div className="aspect-video w-full">
          <iframe
            src={embedUrl}
            title={title ?? 'YouTube video'}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            className="h-full w-full border-0"
          />
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setPlaying(true)}
          aria-label={label}
          className="relative block aspect-video w-full cursor-pointer overflow-hidden"
        >
          <Image
            src={thumbnail}
            alt={title ?? 'YouTube video thumbnail'}
            width={480}
            height={360}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
          />
          <span className="pointer-events-none absolute inset-0 bg-black/20 transition-colors duration-300 group-hover:bg-black/10" />
          <span className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-red-600/95 shadow-lg ring-4 ring-white/30 backdrop-blur-sm transition-transform duration-300 group-hover:scale-110 sm:h-20 sm:w-20">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="white"
                className="ml-1 h-7 w-7 sm:h-9 sm:w-9"
                aria-hidden="true"
              >
                <path d="M8 5v14l11-7z" />
              </svg>
            </span>
          </span>
        </button>
      )}
    </div>
  )
}
