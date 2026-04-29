import { globalAfterChangeRevalidateAll } from '@/app/lib/hooks/payloadHooks'
import { locales } from '@/app/lib/localization/i18n'
import type { GlobalConfig } from 'payload'

export const AboutUs: GlobalConfig = {
  slug: 'about-us',
  label: 'About us',
  hooks: { afterChange: [globalAfterChangeRevalidateAll]},
  admin: {
    description: 'Content for the About us page. Four sections, each localized (ee, ru, en, fi).',
  },
  access: {
    read: () => true,
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
    {
      
      type: 'group',
      label: 'Content',
      fields: locales.map((locale) => ({
        name: locale,
        label: locale,
        type: "richText"
      })),
    },  
  ],
}
 