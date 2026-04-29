import { afterChangeRevalidateAll, afterDeleteRevaledateAll } from '@/app/lib/hooks/payloadHooks'
import type { CollectionConfig } from 'payload'

export const Ticket: CollectionConfig = {
  slug: 'ticket',
  access: {
    read: () => true,
  },
  hooks: { afterChange: [afterChangeRevalidateAll], afterDelete: [afterDeleteRevaledateAll] },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'createdAt'],
    description: 'Ticket name.',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      localized: true,
    },
    {
      name: 'affairs',
      type: 'join',
      collection: 'Affair',
      on: 'tickets.ticket'
    },
  ],
  timestamps: true,
}

