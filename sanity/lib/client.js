import { createClient } from 'next-sanity'
import { apiVersion, dataset, isSanityConfigured, projectId } from '../env'

// Only construct a real client once a Sanity project is actually connected —
// next-sanity validates projectId eagerly and throws if it's empty.
export const client = isSanityConfigured
  ? createClient({ projectId, dataset, apiVersion, useCdn: true })
  : null
