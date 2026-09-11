import { kv } from '@vercel/kv'

export const isKvConfigured = Boolean(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN)

export { kv }
