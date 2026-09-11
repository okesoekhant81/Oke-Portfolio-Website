# Oke Portfolio Website

Personal portfolio site for Oke Soe Khant, built from the Figma design.

## Stack

- Next.js (App Router)
- Tailwind CSS v4
- Framer Motion
- Custom admin panel at `/admin` (Vercel KV for content, Vercel Blob for images)

## Getting started

```bash
npm install
npm run dev
```

Without any setup, the site renders from the bundled default content
(`lib/defaultContent.js`) — nothing breaks if storage isn't connected yet.

## Connecting the admin panel

1. Copy `.env.local.example` to `.env.local`, set `ADMIN_PASSWORD` to something
   strong, and generate `ADMIN_SESSION_SECRET` with `openssl rand -hex 32`.
2. In the Vercel dashboard: **Storage → Create Database → KV** (content) and
   **Storage → Create Database → Blob** (images), both connected to this
   project. Vercel injects their env vars automatically — nothing to copy by
   hand.
3. Also add `ADMIN_PASSWORD` and `ADMIN_SESSION_SECRET` as environment
   variables in the Vercel project settings (same values as your `.env.local`).
4. Redeploy, then open `/admin` and log in with `ADMIN_PASSWORD`.

Once you save changes in `/admin/homepage`, the live site immediately starts
pulling from your saved content instead of the bundled defaults — any field
left blank still falls back to the default, so it's safe to fill in
gradually. `/admin/posts` is full CRUD for blog articles.

Body text fields use a tiny markdown-lite syntax: `*word*` for serif
emphasis, `**word**` for bold italic, and a blank line to start a new
paragraph.

## Build

```bash
npm run build
npm run start
```
