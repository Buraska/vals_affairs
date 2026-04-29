import type { Media } from '@/payload-types'

export type MediaSizeVariant = 'thumbnail' | 'small' | 'medium' | 'large'

export type PickedMediaSize = {
  url: string
  width: number
  height: number
}

/**
 * Pick a pre-generated Payload size variant (thumbnail/small/medium/large)
 * and fall back to the original media URL when the variant is missing.
 *
 * Using a size variant instead of the raw upload avoids sending a multi-MB
 * original through Next's image optimizer (smaller source = smaller transform).
 */
export function pickMediaSize(
  media: Media | null | undefined,
  preferred: MediaSizeVariant = 'large',
): PickedMediaSize {
  if (!media) return { url: '', width: 0, height: 0 }

  const variant = media.sizes?.[preferred]
  if (variant?.url) {
    return {
      url: variant.url,
      width: variant.width ?? 0,
      height: variant.height ?? 0,
    }
  }

  return {
    url: media.url ?? '',
    width: media.width ?? 0,
    height: media.height ?? 0,
  }
}
