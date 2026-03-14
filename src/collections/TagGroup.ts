import type { CollectionConfig } from 'payload'
import { afterChangeHookTagGroup, afterDeleteHookTagGroup } from '@/app/lib/hooks/payloadHooks'

export const TagGroup: CollectionConfig = {
  slug: 'tagGroup',
  hooks: { afterChange: [afterChangeHookTagGroup], afterDelete: [afterDeleteHookTagGroup] },
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
