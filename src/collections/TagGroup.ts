import type { CollectionConfig } from 'payload'
import { afterChangeHookTagGroup } from '@/app/lib/hooks/payloadHooks'

export const TagGroup: CollectionConfig = {
  slug: 'tagGroup',
  hooks: { afterChange: [afterChangeHookTagGroup] },
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
