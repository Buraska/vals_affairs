import type { GlobalConfig } from 'payload'
import { locales } from '@/app/lib/localization/i18n'
import { afterChangeHookWebInfo } from '@/app/lib/hooks/payloadHooks'

export const WebInfo: GlobalConfig = {
  slug: 'web-info',
  label: 'Web info',
  hooks: { afterChange: [afterChangeHookWebInfo]},
  admin: {
    description: 'Site name, description, contact and social links for the header and metadata.',
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      type: 'row',
      fields: [
        {
          name: 'siteName',
          type: 'text',
          label: 'Site name',
          required: true,
          defaultValue: 'Vals',
          admin: { description: 'The very name of the site.' },
        },
        {
          type: 'group',
          name: 'siteDescription',
          fields: locales.map((locale) => ({
            name: locale,
            type: 'textarea',
            label: locale,
            })),
          admin: { description: 'First block (e.g. intro).' },
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'phone',
          type: 'text',
          label: 'Phone number',
          admin: { description: 'e.g. +372 5555555' },
        },
        {
          name: 'email',
          type: 'email',
          label: 'Email',
          admin: { description: 'e.g. info@vals.ee' },
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'instagramUrl',
          type: 'text',
          label: 'Instagram URL',
          admin: { description: 'e.g. https://instagram.com/yourpage' },
        },
        {
          name: 'facebookUrl',
          type: 'text',
          label: 'Facebook URL',
          admin: { description: 'e.g. https://facebook.com/yourpage' },
        },
      ],
    },
  ],
}
