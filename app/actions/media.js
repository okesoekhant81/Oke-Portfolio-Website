'use server'

import { listBlobs } from '../../lib/blobStore'

// Reachable only from ImageField, which only ever renders on /admin/*
// pages — proxy.js gates the route this action's POST lands on, same as
// every other admin-only action in this codebase.
export async function listMediaAction() {
  const blobs = await listBlobs('images/')
  return blobs
    .sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt))
    .slice(0, 60)
    .map((b) => ({ url: b.url, pathname: b.pathname }))
}
