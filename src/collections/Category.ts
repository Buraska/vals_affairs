import { afterChangeHookCategory } from '@/app/lib/hooks/payloadHooks'
import type { CollectionConfig } from 'payload'

export const Category: CollectionConfig = {
  slug: 'category',
  access: {
    read: () => true,
  },
  hooks: {afterChange: [afterChangeHookCategory]},
  admin:{
    useAsTitle:'title'
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
      type: 'text',
      localized: true,
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      required: true
    },
    {
      name: 'parent category',
      type: 'relationship',
      relationTo: 'category',
    },
    {
      name: 'child categories',
      type: 'join',
      collection: 'category',
      on: 'parent category'
    },
    {
      name: 'affairs',
      type: 'join',
      collection: 'Affair',
      on: 'category'
    }
  ],
  defaultPopulate: {
    slug: true,
    title: true
  }
}
