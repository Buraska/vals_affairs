import { locales } from '@/app/lib/localization/i18n'
import type { GlobalConfig } from 'payload'

export const AboutUs: GlobalConfig = {
  slug: 'about-us',
  label: 'About us',
  admin: {
    description: 'Content for the About us page. Four sections, each localized (ee, ru, en, fi).',
  },
  access: {
    read: () => true,
  },
  fields: [    
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
