'use server'

import { setPostLiked } from '../../lib/content/analytics'

export async function setPostLikedAction(slug, liked) {
  return setPostLiked(slug, liked)
}
