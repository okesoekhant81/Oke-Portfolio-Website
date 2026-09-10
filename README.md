# Oke Portfolio Website

Personal portfolio site for Oke Soe Khant, built from the Figma design.

## Stack

- Next.js (App Router)
- Tailwind CSS v4
- Framer Motion
- Sanity (CMS + admin panel, embedded at `/studio`)

## Getting started

```bash
npm install
npm run dev
```

Without any setup, the site renders from the bundled default content
(`lib/defaultContent.js`) — nothing breaks if Sanity isn't connected yet.

## Connecting the CMS

1. Create a free project at [sanity.io/manage](https://www.sanity.io/manage) (or run `npx sanity init` from this folder and choose "create new project").
2. Copy `.env.local.example` to `.env.local` and fill in the project ID it gives you:
   ```
   NEXT_PUBLIC_SANITY_PROJECT_ID=your-project-id
   NEXT_PUBLIC_SANITY_DATASET=production
   ```
3. Add the site's own URL to that Sanity project's CORS origins (Manage → API → CORS Origins) so the Studio can talk to it — add both your local dev URL and the deployed Vercel URL.
4. Run the site and open `/studio` — sign in with the same account, and you'll see:
   - **Homepage** — every section's text and images, grouped by section
   - **Articles** — blog posts (title, cover image, body)
5. Once you save a "Homepage" document in the Studio, the live site immediately
   starts pulling from it instead of the bundled defaults — any field left
   empty still falls back to the default content, so it's safe to fill in
   gradually.

On Vercel, add the same two `NEXT_PUBLIC_SANITY_*` environment variables in
the project settings so the deployed site can connect too.

## Build

```bash
npm run build
npm run start
```
