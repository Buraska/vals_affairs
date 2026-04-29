import type { CollectionConfig } from 'payload'
import { afterChangeRevalidateAll, afterDeleteRevaledateAll } from '@/app/lib/hooks/payloadHooks'

export const TagGroup: CollectionConfig = {
  slug: 'tagGroup',
  hooks: { afterChange: [afterChangeRevalidateAll], afterDelete: [afterDeleteRevaledateAll] },
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
