import type { CollectionConfig } from 'payload'
import { afterChangeRevalidateAll, afterDeleteRevaledateAll } from '@/app/lib/hooks/payloadHooks'

export const Gallery: CollectionConfig = {
  slug: 'gallery',
  access: {
    read: () => true,
  },
  hooks: { afterChange: [afterChangeRevalidateAll], afterDelete: [afterDeleteRevaledateAll] },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'date', 'updatedAt'],
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      localized: true,
    },
    {
      name: 'date',
      type: 'date',
      required: true,
      defaultValue: () => new Date().toISOString(),
      admin: {
        date: {
          pickerAppearance: 'dayOnly',
          displayFormat: 'dd.MM.yyyy',
        },
        position: 'sidebar',
      },
    },
    {
      name: 'photos',
      type: 'array',
      required: true,
      fields: [
        {
          name: 'photo',
          type: 'upload',
          relationTo: 'media',
          required: true,
        },
      ],
    },
    {
      name: 'videos',
      type: 'array',
      labels: { singular: 'Video', plural: 'Videos' },
      fields: [
        {
          name: 'youtubeUrl',
          type: 'text',
          required: true,
          validate: ((val: string | null | undefined) => {
            if (!val) return 'URL is required'
            return /(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)[\w-]{11}/.test(val)
              ? true
              : 'Must be a valid YouTube URL'
          }) as never,
        },
      ],
    },
  ],
}

