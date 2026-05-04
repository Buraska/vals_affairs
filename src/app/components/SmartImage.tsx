'use client'

import NextImage, { type ImageProps } from 'next/image'
import {
  forwardRef,
  useCallback,
  useEffect,
  useRef,
  type SyntheticEvent,
} from 'react'

import type { Media } from '@/payload-types'
import { pickMediaSize, type MediaSizeVariant } from '@/utilities/pickMediaSize'
import { cn } from '@/utilities/ui'
import { useRegisterImage } from '@/app/components/SectionImageReveal'

/** Tiny inline SVG for blur placeholder (no `xmlns` / xlink URIs). */
const shimmer = (w: number, h: number) =>
  `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none">` +
  `<defs><linearGradient id="g">` +
  `<stop stop-color="#ddd" offset="20%"/><stop stop-color="#eee" offset="50%"/><stop stop-color="#ddd" offset="70%"/>` +
  `</linearGradient></defs>` +
  `<rect width="${w}" height="${h}" fill="#e2d9c8"/><rect width="${w}" height="${h}" fill="url(#g)"/>` +
  `</svg>`

const toBase64 = (str: string) =>
  typeof window === 'undefined' ? Buffer.from(str).toString('base64') : window.btoa(str)

const DEFAULT_BLUR = `data:image/svg+xml;base64,${toBase64(shimmer(32, 24))}`

type SmartImageProps = Omit<ImageProps, 'src' | 'width' | 'height'> & {
  src?: ImageProps['src']
  width?: ImageProps['width']
  height?: ImageProps['height']
  /** When provided, SmartImage picks a Payload size variant URL automatically. */
  resource?: Media | null
  /** Which Payload size variant to prefer when `resource` is used. */
  preferredSize?: MediaSizeVariant
}

/**
 * Drop-in replacement for `next/image` with:
 *   - sane default quality (75)
 *   - a tiny SVG blur placeholder (no quality-destroying clamp)
 *   - optional `resource` prop that auto-picks a Payload size variant
 *   - integrates with an ancestor SectionImageReveal so a whole batch of
 *     images stay invisible behind per-image skeletons until every image
 *     in the section has finished loading.
 */
const SmartImage = forwardRef<HTMLImageElement, SmartImageProps>(function SmartImage(
  {
    resource,
    preferredSize = 'small',
    src: srcProp,
    width: widthProp,
    height: heightProp,
    alt,
    quality = 75,
    placeholder,
    blurDataURL,
    fill,
    className,
    onLoad,
    onError,
    ...rest
  },
  ref,
) {
  const { revealed, reportLoaded } = useRegisterImage()
  const hasReported = useRef(false)
  const imgRef = useRef<HTMLImageElement | null>(null)

  const reportOnce = useCallback(() => {
    if (hasReported.current) return
    hasReported.current = true
    reportLoaded()
  }, [reportLoaded])

  const setRefs = useCallback(
    (node: HTMLImageElement | null) => {
      imgRef.current = node
      if (typeof ref === 'function') ref(node)
      else if (ref) ref.current = node
    },
    [ref],
  )

  useEffect(() => {
    if (imgRef.current?.complete) reportOnce()
  }, [reportOnce])

  const handleLoad = useCallback(
    (event: SyntheticEvent<HTMLImageElement>) => {
      reportOnce()
      onLoad?.(event)
    },
    [onLoad, reportOnce],
  )

  const handleError = useCallback(
    (event: SyntheticEvent<HTMLImageElement>) => {
      reportOnce()
      onError?.(event)
    },
    [onError, reportOnce],
  )

  let finalSrc = srcProp
  let finalWidth = widthProp
  let finalHeight = heightProp
  let finalAlt = alt

  if (resource) {
    const picked = pickMediaSize(resource, preferredSize)
    if (!finalSrc) finalSrc = picked.url
    if (!fill) {
      if (finalWidth == null && picked.width) finalWidth = picked.width
      if (finalHeight == null && picked.height) finalHeight = picked.height
    }
    if (finalAlt == null) finalAlt = resource.alt ?? ''
  }

  if (!finalSrc) return null

  // One transition-property must cover both reveal (opacity) and caller hover
  // (transform). `transition-transform` + `transition-opacity` conflict — only
  // one wins in generated CSS, so opacity often never animates.
  const mergedImgClassName = cn(
    className,
    'transition-[opacity,transform] duration-500 ease-out',
    revealed ? 'opacity-100' : 'opacity-0',
  )

  const commonProps = {
    alt: finalAlt ?? '',
    quality,
    placeholder: placeholder ?? 'blur',
    blurDataURL: blurDataURL ?? DEFAULT_BLUR,
    onLoad: handleLoad,
    onError: handleError,
    ref: setRefs,
    src: finalSrc,
    className: mergedImgClassName,
    ...rest,
  } as const

  // Skeleton is visible only while the section hasn't revealed yet.
  // It sits behind the image using the same box geometry so layout never
  // shifts when it unmounts.
  const skeleton = !revealed ? (
    <span
      aria-hidden
      className="pointer-events-none absolute inset-0 animate-pulse bg-[var(--border)]/70"
    />
  ) : null

  if (fill) {
    // Caller's parent already provides the positioned, sized box.
    return (
      <>
        {skeleton}
        <NextImage {...commonProps} fill />
      </>
    )
  }

  return (
    <span className="relative inline-block w-full align-top">
      {skeleton}
      <NextImage
        {...commonProps}
        width={finalWidth ?? 1200}
        height={finalHeight ?? 800}
      />
    </span>
  )
})

export default SmartImage
