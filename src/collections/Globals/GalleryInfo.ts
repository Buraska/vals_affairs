import type { GlobalConfig } from 'payload'
import { locales } from '@/app/lib/localization/i18n'

export const GalleryInfo: GlobalConfig = {
  slug: 'gallery-info',
  label: 'Gallery info',
  access: {
    read: () => true,
  },
  admin: {
    description: 'Title, description and hero photo for the Gallery page.',
  },
  fields: [
    {
      type: 'group',
      name: 'name',
      fields: locales.map((locale) => ({
        name: locale,
        label: locale,
        type: 'textarea',
      })),
    },
    {
      type: 'group',
      name: 'description',
      fields: locales.map((locale) => ({
        name: locale,
        label: locale,
        type: 'textarea',
      })),
    },
    {
      name: 'photo',
      type: 'upload',
      relationTo: 'media',
      required: true,
    },
  ],
}

