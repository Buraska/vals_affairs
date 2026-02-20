import type { CollectionConfig } from 'payload'

export const Affair: CollectionConfig = {
  slug: 'Affair',
  access: {
    read: () => true,
  },
  admin:{
    useAsTitle:'title',
    defaultColumns: ['title',  'category', 'description', 'currently slots', 'total slots']
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
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
      type: 'row',
      fields:[
        {
          name: 'total slots',
          type: 'number'
        },
        {
          name: 'currently slots',
          type: 'number',
        },
      ]
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
        name: "ticket name",
        type: "text",
        localized: true,

        },
        {
          name: "ticket price",
          type: "number",
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
    title: true
  }
}
