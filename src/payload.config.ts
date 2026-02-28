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
import { Team } from './collections/Team'
import { WebInfo } from './collections/Globals/WebInfo'
import { UserAgreements } from './collections/Globals/UserAgreements'
import { AboutUs } from './collections/Globals/AboutUs'
import { defaultLocale, locales } from './app/lib/localization/i18n'
import { vercelBlobStorage } from '@payloadcms/storage-vercel-blob'

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
  collections: [Users, Media, Category, Affair, Tag, TagGroup, Team],
  globals: [WebInfo, UserAgreements, AboutUs],
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
    vercelBlobStorage({
      enabled: true, // Optional, defaults to true
      // Specify which collections should use Vercel Blob
      collections: {
        media: true,
      },
      clientUploads: false,
      token: process.env.BLOB_READ_WRITE_TOKEN,
    })
  ],
})
