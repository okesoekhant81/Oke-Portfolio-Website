export const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-01-01'

export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'

export const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || ''

// True once a real Sanity project has been connected. Until then, pages fall
// back to the bundled default content instead of trying to fetch.
export const isSanityConfigured = Boolean(projectId)
