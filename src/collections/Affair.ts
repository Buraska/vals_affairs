import { afterChangeHookAffair, afterDeleteHookAffair } from '@/app/lib/hooks/payloadHooks'
import type { CollectionConfig } from 'payload'

export const Affair: CollectionConfig = {
  slug: 'Affair',
  hooks: { afterChange: [afterChangeHookAffair], afterDelete: [afterDeleteHookAffair] },
  access: {
    read: () => true,
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'category', 'description', 'isAvailable', 'start date', 'end date'],
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      localized: true,

    },
    {
      name: 'description',
      type: 'richText',
      required: true,
      localized: true,
    },
    {
      name: 'images',
      type: 'array',
      required: true,
      fields:[
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media'
        }
      ]
    },
    {
      name: 'category',
      type: 'relationship',
      relationTo: 'category',
      required: true,
    },
    {
      name: 'price',
      type: 'number',
      required: true,
    },
    {
      name: 'isAvailable',
      type: 'checkbox',
      defaultValue: true,
      admin: { description: 'Whether this affair is available for booking.' },
    },
    {
      type: 'row',
      fields: 
      [
        {
          name: 'start date',
          type: 'date',
          required: true,
        },
        {
          name: 'end date',
          type: 'date',
        }
      ]
    },
    {
      name: 'tickets',
      type: 'array',
      required: true,
      fields:
      [
        {
        name: "ticket",
        type: "relationship",
        relationTo: "ticket",
        required: true,
        },
        {
          name: "ticket price",
          type: "number",
        required: true,

        },
      ]
    },
    {
      name: "additional info",
      type: "array",
      fields: [
        {
          name: "title",
          type: "text",
          localized: true,
        },
        {
          name: "content",
          type: "richText",
          localized: true,

        }
      ]
    },
    {
      name: 'tags',
      type: 'array',
      fields: [
        {
          name: 'tag',
          type: 'relationship',
          relationTo: 'tag'
        }
      ]
    },
  ],
  defaultPopulate: {
    slug: true,
    title: true,
    category: true
  }
}
