import { afterChangeRevalidateAll, afterDeleteRevaledateAll } from '@/app/lib/hooks/payloadHooks'
import type { CollectionConfig } from 'payload'

export const Affair: CollectionConfig = {
  slug: 'Affair',
  hooks: { afterChange: [afterChangeRevalidateAll], afterDelete: [afterDeleteRevaledateAll] },
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
      name: 'slug',
      type: 'text',
      index: true,
      admin: {
        position: 'sidebar',
        description: 'URL slug. Use "Generate from title" or edit manually.',
        components: {
          Field: '/app/components/admin/SlugField',
        },
      },
    },
    {
      name: 'description',
      type: 'richText',
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
    {
      name: 'location',
      type: 'group',
      admin: {
        description:
          'Where the event takes place. Used for Event structured data (SEO). Falls back to the site default in Web info when left empty.',
      },
      fields: [
        {
          name: 'venueName',
          type: 'text',
          localized: true,
          admin: { description: 'e.g. Vabaduse väljak' },
        },
        {
          type: 'row',
          fields: [
            { name: 'streetAddress', type: 'text' },
            { name: 'city', type: 'text' },
          ],
        },
        {
          type: 'row',
          fields: [
            { name: 'postalCode', type: 'text' },
            {
              name: 'country',
              type: 'text',
              defaultValue: 'EE',
              admin: { description: 'ISO country code, e.g. EE' },
            },
          ],
        },
      ],
    },
  ],
  defaultPopulate: {
    slug: true,
    title: true,
    category: true
  }
}
