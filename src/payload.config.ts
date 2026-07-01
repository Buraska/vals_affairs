import { mongooseAdapter } from '@payloadcms/db-mongodb'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig, type Config } from 'payload'
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
import { seoPlugin } from '@payloadcms/plugin-seo'
import { lexicalToPlainText } from './utilities/lexicalToPlainText'
import { SITE_NAME } from './utilities/seo'

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
    seoPlugin({
      collections: ['Affair', 'category'],
      uploadsCollection: 'media',
      tabbedUI: true,
      generateTitle: ({ doc }: { doc?: { title?: string } }) =>
        doc?.title ? `${doc.title} | ${SITE_NAME}` : SITE_NAME,
      generateDescription: ({
        doc,
      }: {
        doc?: { description?: unknown }
      }) => {
        const description = doc?.description
        if (typeof description === 'string') return description
        // Affair descriptions are Lexical rich text.
        const plain = lexicalToPlainText(
          description as Parameters<typeof lexicalToPlainText>[0],
        )
        return plain.length > 160 ? `${plain.slice(0, 157)}...` : plain
      },
      // Pre-fill the meta image from the first gallery image when an editor uses
      // the admin "auto-generate" button. The frontend applies the same fallback
      // at render time, so this is purely an admin convenience.
      generateImage: ({
        doc,
      }: {
        doc?: { images?: { image?: unknown }[] }
      }) => {
        const first = doc?.images?.find((entry) => entry?.image != null)?.image
        if (typeof first === 'string') return first
        if (typeof first === 'object' && first != null && 'id' in first) {
          return (first as { id: string | number }).id
        }
        return ''
      },
      // Make the meta fields localized so each locale has its own SEO copy.
      fields: ({ defaultFields }) =>
        defaultFields.map((field) =>
          'name' in field &&
          ['title', 'description', 'image'].includes(field.name)
            ? { ...field, localized: true }
            : field,
        ),
    }),
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
    ...(process.env.S3_BUCKET
      ? [
          s3Storage({
            collections: { 
              media: {generateFileURL: ({ filename, prefix }) => {
                    const key = prefix ? `${prefix}/${filename}` : filename
                    return `https://${process.env.S3_BUCKET}.s3.${process.env.S3_REGION}.amazonaws.com/${key}`
                }}
            },
                          // {
              //   disablePayloadAccessControl: true,
              //   generateFileURL: ({ filename, prefix }) => {
              //     const key = prefix ? `${prefix}/${filename}` : filename
              //     return `https://${process.env.S3_BUCKET}.s3.${process.env.S3_REGION}.amazonaws.com/${key}`
              //   },
              // },
            bucket: process.env.S3_BUCKET,
            // Bypass Vercel's ~4.5 MB serverless body limit by uploading the
            // original file directly from the browser to R2 via a presigned
            // URL. Requires CORS to be configured on the R2 bucket (see README).

            config: {
              // endpoint: process.env.R2_ENDPOINT, // For R2 storage
              region: process.env.S3_REGION,
              forcePathStyle: true,
              credentials: {
                accessKeyId: process.env.S3_ACCESS_KEY_ID ?? '',
                secretAccessKey: process.env.S3_SECRET_ACCESS_KEY ?? '',
              },
            },
          }),
          // Append AFTER s3Storage so our provider mounts last and its
          // setUploadHandler() call wins for the `media` collection. Our
          // handler downscales huge images in the browser before PUTting
          // them straight to R2.

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
