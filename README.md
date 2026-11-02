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
## Automatic affair archiving

Completed affairs are archived by a daily GitHub Actions workflow and are also
treated as archived immediately by listings and booking checks. Expiration uses
the end date when set, otherwise the start date. The workflow can also be run
manually from the Actions tab.

Configure the same non-empty `AFFAIR_ARCHIVE_CRON_SECRET` in the Vercel
project's production environment variables and GitHub repository Actions
secrets. Redeploy on Vercel after setting the runtime variable. The scheduled
workflow calls `https://www.thenextchance.eu/api/cron/archive-past-affairs`.
Update the workflow URL if the public deployment host changes.

## Optional affair start time

Affairs may set the optional `start time` field in 24-hour `HH:mm` format
(for example, `07:00`). The event page displays this value when present and
does not infer a time from the date when the field is empty.

## Affair order page

The order form and event details are prerendered so they appear in the initial
HTML. Only the selected ticket quantities and total read the `q` URL parameter
on the client. The submit button stays disabled until that selection is ready,
then the same quantities are used for the summary and submitted order.

## Advertising HTML endpoint

`GET /api/admin/get-advertising` returns the Russian HTML used for newsletter campaigns. It includes affairs that are available (`isAvailable` is not false), not explicitly archived, and not expired. Expiration uses the end date when set, otherwise the start date. Responses are not cached, so expired events are not served from stale HTML. The email header uses inline text/background styles and a solid `bgcolor` fallback; the gradient is an enhancement for clients that support it.
