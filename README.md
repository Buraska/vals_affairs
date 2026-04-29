# Vals

This is a Next.js app connected to the headless CMS **Payload**. The site serves as a placeholder for upcoming events: clients can browse events and submit a form to participate.

The frontend is mostly static and uses **ISR** (Incremental Static Regeneration) to serve pages, making it significantly faster than traditional PHP apps. It is intended to run with **MongoDB** and **Cloudflare R2** storage.

The project includes an updated **Dockerfile** and can be deployed on any VPS.

- Live: https://vals-affairs.vercel.app/ee

## Media uploads on Vercel (R2 CORS)

Vercel serverless functions cap request bodies at ~4.5 MB, which would
otherwise reject every photo larger than that when an admin tries to upload
one. The `media` collection therefore uses the `clientUploads` feature of
`@payloadcms/storage-s3` so the original file is uploaded directly from the
browser to Cloudflare R2 via a presigned URL, completely bypassing the
serverless function for the bytes themselves.

For this to work, the R2 bucket must allow CORS `PUT` requests from the site.
Configure the following CORS policy on the bucket (Cloudflare dashboard →
R2 → your bucket → Settings → CORS Policy):

```json
[
  {
    "AllowedOrigins": [
      "https://vals-affairs.vercel.app",
      "http://localhost:3000"
    ],
    "AllowedMethods": ["GET", "PUT", "HEAD"],
    "AllowedHeaders": ["*"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3000
  }
]
```

Add any additional production / preview domains to `AllowedOrigins` as
needed. Without this rule the browser PUT to R2 will be blocked and uploads
will fail with a CORS error.
