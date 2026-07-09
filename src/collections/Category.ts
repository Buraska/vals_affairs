import { afterChangeRevalidateAll, afterDeleteRevaledateAll } from '@/app/lib/hooks/payloadHooks'
import type { CollectionConfig } from 'payload'

export const Category: CollectionConfig = {
  slug: 'category',
  access: {
    read: () => true,
  },
  hooks: { afterChange: [afterChangeRevalidateAll], afterDelete: [afterDeleteRevaledateAll] },
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
