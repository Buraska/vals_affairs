import { locales } from '@/app/lib/localization/i18n'
import type { GlobalConfig } from 'payload'

export const UserAgreements: GlobalConfig = {
  slug: 'user-agreements',
  label: 'User agreements',
  admin: {
    description: 'Content for the Terms of Use page. Four sections, each localized (ee, ru, en, fi).',
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
        type: "richText"
      })),
      admin: { description: 'First block (e.g. intro).' },
    },
  ],
}
