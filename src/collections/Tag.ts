import type { CollectionConfig } from 'payload'
import { afterChangeHookTag } from '@/app/lib/hooks/payloadHooks'

export const Tag: CollectionConfig = {
  slug: 'tag',
  hooks: { afterChange: [afterChangeHookTag] },
  access: {
    read: () => true,
  },
  admin:{
    useAsTitle:'name'
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      localized: true,
      required: true,
    },
    {
      name: 'tag group',
      type: 'relationship',
      relationTo: 'tagGroup',
      required: true
    },
    {
      name: 'affairs',
      type: 'join',
      collection: 'Affair',
      on: 'tags.tag'
    }
  ],
}
