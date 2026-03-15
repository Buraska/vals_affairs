import { mongooseAdapter } from '@payloadcms/db-mongodb'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { Category } from './collections/Category'
import { Media } from './collections/System/Media'
import { Users } from './collections/System/Users'
import { Affair } from './collections/Affair'
import { Tag } from './collections/Tag'
import { TagGroup } from './collections/TagGroup'
import { WebInfo } from './collections/Globals/WebInfo'
import { Team } from './collections/Globals/Team'
import { UserAgreements } from './collections/Globals/UserAgreements'
import { AboutUs } from './collections/Globals/AboutUs'
import { defaultLocale, locales } from './app/lib/localization/i18n'
import { s3Storage } from '@payloadcms/storage-s3'

/** Display names for locales (used in language switcher, empty-categories block, etc.) */
export const localeLabels: Record<string, string> = {
  ee: 'Eesti',
  ru: 'Русский',
  en: 'English',
  fi: 'Suomi',
}

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
  globals: [WebInfo, UserAgreements, AboutUs, Team],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: mongooseAdapter({
    url: process.env.DATABASE_URL || '',
  }),
  sharp,
  plugins: [
    // R2: set R2_BUCKET, R2_ENDPOINT (https://<ACCOUNT_ID>.r2.cloudflarestorage.com), R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY
    ...(process.env.R2_BUCKET
      ? [
          s3Storage({
            collections: { media: true },
            bucket: process.env.R2_BUCKET,
            config: {
              endpoint: process.env.R2_ENDPOINT,
              region: 'auto',
              forcePathStyle: true,
              credentials: {
                accessKeyId: process.env.R2_ACCESS_KEY_ID ?? '',
                secretAccessKey: process.env.R2_SECRET_ACCESS_KEY ?? '',
              },
            },
          }),
        ]
      : []),
  ],
})
