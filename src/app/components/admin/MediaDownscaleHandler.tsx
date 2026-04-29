'use client'

import { createClientUploadHandler } from '@payloadcms/plugin-cloud-storage/client'
import { formatAdminURL } from 'payload/shared'

const MAX_DIMENSION = 4000
const MAX_BYTES = 8 * 1024 * 1024
const JPEG_QUALITY = 0.85

const SKIP_MIME_TYPES = new Set(['image/svg+xml', 'image/gif'])

async function readImageBitmap(file: File): Promise<ImageBitmap | null> {
  try {
    return await createImageBitmap(file)
  } catch {
    return null
  }
}

async function downscaleIfNeeded(file: File): Promise<File> {
  if (!file.type.startsWith('image/')) return file
  if (SKIP_MIME_TYPES.has(file.type)) return file
  if (typeof OffscreenCanvas === 'undefined' || typeof createImageBitmap === 'undefined') {
    return file
  }

  const bitmap = await readImageBitmap(file)
  if (!bitmap) return file

  const longest = Math.max(bitmap.width, bitmap.height)
  const needsResize = longest > MAX_DIMENSION
  const needsRecompress = file.size > MAX_BYTES

  if (!needsResize && !needsRecompress) {
    bitmap.close?.()
    return file
  }

  const scale = needsResize ? MAX_DIMENSION / longest : 1
  const targetWidth = Math.max(1, Math.round(bitmap.width * scale))
  const targetHeight = Math.max(1, Math.round(bitmap.height * scale))

  let blob: Blob
  try {
    const canvas = new OffscreenCanvas(targetWidth, targetHeight)
    const ctx = canvas.getContext('2d')
    if (!ctx) {
      bitmap.close?.()
      return file
    }
    ctx.drawImage(bitmap, 0, 0, targetWidth, targetHeight)
    bitmap.close?.()
    const outType = file.type === 'image/png' ? 'image/png' : 'image/jpeg'
    blob = await canvas.convertToBlob({
      type: outType,
      quality: outType === 'image/jpeg' ? JPEG_QUALITY : undefined,
    })
  } catch {
    return file
  }

  // If our re-encode somehow produced a larger file (rare), keep the original.
  if (blob.size >= file.size && !needsResize) {
    return file
  }

  const isPng = blob.type === 'image/png'
  const ext = isPng ? 'png' : 'jpg'
  const baseName = file.name.replace(/\.[^.]+$/, '') || 'image'
  return new File([blob], `${baseName}.${ext}`, {
    type: blob.type,
    lastModified: file.lastModified,
  })
}

/**
 * Wraps the default `@payloadcms/storage-s3` client upload handler with an
 * in-browser downscale pass so we don't ship 60-megapixel originals to R2.
 *
 * The actual presigned-URL + PUT flow mirrors `S3ClientUploadHandler` from
 * `@payloadcms/storage-s3/client`. We register this provider AFTER the S3
 * plugin's own provider in `payload.config.ts`, so its `setUploadHandler`
 * call wins (last writer in the providers array).
 */
export const MediaDownscaleHandler = createClientUploadHandler({
  handler: async ({
    apiRoute,
    collectionSlug,
    file,
    prefix,
    serverHandlerPath,
    serverURL,
    updateFilename,
  }) => {
    const optimized = await downscaleIfNeeded(file)

    if (optimized !== file && typeof updateFilename === 'function') {
      updateFilename(optimized.name)
    }

    const endpointRoute = formatAdminURL({
      apiRoute,
      path: serverHandlerPath,
      serverURL,
    })

    const response = await fetch(endpointRoute, {
      body: JSON.stringify({
        collectionSlug,
        filename: optimized.name,
        filesize: optimized.size,
        mimeType: optimized.type,
      }),
      credentials: 'include',
      method: 'POST',
    })

    if (!response.ok) {
      const { errors } = (await response.json()) as { errors?: Array<{ message: string }> }
      const message = (errors ?? [])
        .reduce((acc, err) => `${acc ? `${acc}, ` : ''}${err.message}`, '')
      throw new Error(message || 'Failed to obtain a signed upload URL')
    }

    const { url } = (await response.json()) as { url: string }

    await fetch(url, {
      body: optimized,
      headers: {
        'Content-Length': optimized.size.toString(),
        'Content-Type': optimized.type,
      },
      method: 'PUT',
    })

    return { prefix }
  },
})

export default MediaDownscaleHandler
