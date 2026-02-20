import { mongooseAdapter } from '@payloadcms/db-mongodb'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { Category } from './collections/Category'
import { Media } from './collections/Media'
import { Users } from './collections/Users'
import { Affair } from './collections/Affair'
import { Tag } from './collections/Tag'
import { TagGroup } from './collections/TagGroup'
import { defaultLocale, locales } from './app/lib/localization/i18n'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  localization: {
    locales: [...locales],  
    defaultLocale: defaultLocale,  
    fallback: false
  },
  collections: [Users, Media, Category, Affair, Tag, TagGroup],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: mongooseAdapter({
    url: process.env.DATABASE_URL || '',
  }),
  sharp,
  plugins: [],
})
