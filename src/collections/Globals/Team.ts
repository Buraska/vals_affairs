import type { GlobalConfig } from 'payload'
import { locales } from '@/app/lib/localization/i18n'
import { afterChangeHookTeam } from '@/app/lib/hooks/payloadHooks'

export const Team: GlobalConfig = {
  slug: 'team',
  label: 'Team',
  hooks: { afterChange: [afterChangeHookTeam] },
  access: {
    read: () => true,
  },
  admin: {
    description: 'Team members with name, contacts, description and photo.',
  },
  fields: [
    {
      name: 'members',
      type: 'array',
      label: 'Team members',
      admin: {
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
    },
  ],
}
