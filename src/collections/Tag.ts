import type { CollectionConfig } from 'payload'

export const Tag: CollectionConfig = {
  slug: 'tag',
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
  ],
}
