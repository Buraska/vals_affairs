import type { CollectionConfig } from 'payload'
import { locales } from '../app/lib/localization/i18n'


export const Team: CollectionConfig = {
  slug: 'team',
  access: {
    read: () => true,
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'phone', 'email', 'createdAt'],
    description: 'Team members with name, contacts, description and photo.',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      label: 'Name',
    },
    {
      name: 'photo',
      type: 'upload',
      relationTo: 'media',
      required: true,
      label: 'Photo',
      admin: { description: 'Profile or team member photo.' },
    },
    {
      name: 'description',
      type: 'group',
      label: 'Description',
      admin: {
        description: 'Short bio or role description. All languages on one page.',
      },
      fields: locales.map((locale) => ({
        name: locale,
        type: 'textarea' as const,
      })),
    },
    {
      type: 'row',
      fields: [
        {
          name: 'phone',
          type: 'text',
          label: 'Phone',
          admin: { description: 'e.g. +372 5555555' },
        },
        {
          name: 'email',
          type: 'email',
          label: 'Email',
          admin: { description: 'e.g. name@example.com' },
        },
      ],
    },
  ],
  timestamps: true,
}
