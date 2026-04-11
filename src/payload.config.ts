import { mongooseAdapter } from '@payloadcms/db-mongodb'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'
import { nodemailerAdapter } from '@payloadcms/email-nodemailer'
import nodemailer from 'nodemailer'


import { Category } from './collections/Category'
import { Media } from './collections/System/Media'
import { Users } from './collections/System/Users'
import { Affair } from './collections/Affair'
import { Tag } from './collections/Tag'
import { TagGroup } from './collections/TagGroup'
import { Ticket } from './collections/Ticket'
import { Gallery } from './collections/Gallery'
import { Order } from './collections/Order'
import { WebInfo } from './collections/Globals/WebInfo'
import { BankCredentials } from './collections/Globals/BankCrediants'
import { Team } from './collections/Globals/Team'
import { UserAgreements } from './collections/Globals/UserAgreements'
import { AboutUs } from './collections/Globals/AboutUs'
import { GalleryInfo } from './collections/Globals/GalleryInfo'
import { defaultLocale, locales } from './app/lib/localization/i18n'
import { s3Storage } from '@payloadcms/storage-s3'
import { mcpPlugin } from '@payloadcms/plugin-mcp'

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
  collections: [Users, Media, Category, Affair, Tag, TagGroup, Ticket, Gallery, Order],
  globals: [WebInfo, BankCredentials, UserAgreements, AboutUs, Team, GalleryInfo],
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
    mcpPlugin({
      collections: {
        users: { enabled: true },
        media: { enabled: true },
        category: { enabled: true },
        Affair: { enabled: true },
        tag: { enabled: true },
        tagGroup: { enabled: true },
        ticket: { enabled: true },
        gallery: { enabled: true },
        order: { enabled: true },
      },
      globals: {
        'web-info': { enabled: true },
        'user-agreements': { enabled: true },
        'about-us': { enabled: true },
        team: { enabled: true },
        'gallery-info': { enabled: true },
      },
    }),
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
  email: nodemailerAdapter({
    defaultFromAddress: 'info@thenextchance.eu',
    defaultFromName: 'Payload',

    transport: nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: 587,
    auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASSWORD
    }
    })

  }),
})
