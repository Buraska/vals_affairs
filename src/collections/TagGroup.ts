import type { CollectionConfig } from 'payload'

export const TagGroup: CollectionConfig = {
  slug: 'tagGroup',
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
      required: true,
      localized: true
    },
    {
      name: 'tagGroup',
      type: 'join',
      collection: 'tag',
      on: 'tag group'
    },
  ],
}
