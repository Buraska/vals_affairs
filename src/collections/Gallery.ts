import type { CollectionConfig } from 'payload'
import { afterChangeHookGallery, afterDeleteHookGallery } from '@/app/lib/hooks/payloadHooks'

export const Gallery: CollectionConfig = {
  slug: 'gallery',
  access: {
    read: () => true,
  },
  hooks: { afterChange: [afterChangeHookGallery], afterDelete: [afterDeleteHookGallery] },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'driveLink', 'updatedAt'],
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      localized: true,
    },
    {
      name: 'driveLink',
      type: 'text',
      required: true,
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
  ],
}

