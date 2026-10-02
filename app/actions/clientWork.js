'use server'

import { revalidatePath } from 'next/cache'
import { addClientWork, updateClientWork, deleteClientWork, reorderClientWork, getClientWork } from '../../lib/content/clientWork'
import { cleanupReplacedImages, cleanupAllImages } from '../../lib/imageCleanup'
import { logActivity } from '../../lib/activityLog'

const MAX_LENGTHS = { name: 120, scope: 160, description: 1000, highlight: 200 }

function revalidateAll() {
  revalidatePath('/admin/client-work')
  revalidatePath('/')
}

export async function addClientWorkAction(prevState, formData) {
  const get = (key) => formData.get(key)?.toString().trim() ?? ''
  const name = get('name').slice(0, MAX_LENGTHS.name)
  if (!name) return { error: 'Please enter a client/project name.' }

  try {
    await addClientWork({
      name,
      logo: get('logo'),
      scope: get('scope').slice(0, MAX_LENGTHS.scope),
      scopeMy: get('scopeMy').slice(0, MAX_LENGTHS.scope),
      description: get('description').slice(0, MAX_LENGTHS.description),
      descriptionMy: get('descriptionMy').slice(0, MAX_LENGTHS.description),
      highlight: get('highlight').slice(0, MAX_LENGTHS.highlight),
      highlightMy: get('highlightMy').slice(0, MAX_LENGTHS.highlight),
    })
  } catch (err) {
    return { error: err.message || 'Could not save. Please try again.' }
  }

  await logActivity('Client work added', name)
  revalidateAll()
  return { success: true, savedAt: Date.now() }
}

export async function updateClientWorkAction(formData) {
  const id = formData.get('id')?.toString()
  if (!id) return { error: 'Missing entry.' }

  const get = (key) => formData.get(key)?.toString().trim() ?? ''
  const name = get('name').slice(0, MAX_LENGTHS.name)
  if (!name) return { error: 'Please enter a client/project name.' }

  const previous = (await getClientWork()).find((w) => w.id === id)
  const data = {
    name,
    logo: get('logo'),
    scope: get('scope').slice(0, MAX_LENGTHS.scope),
    scopeMy: get('scopeMy').slice(0, MAX_LENGTHS.scope),
    description: get('description').slice(0, MAX_LENGTHS.description),
    descriptionMy: get('descriptionMy').slice(0, MAX_LENGTHS.description),
    highlight: get('highlight').slice(0, MAX_LENGTHS.highlight),
    highlightMy: get('highlightMy').slice(0, MAX_LENGTHS.highlight),
  }
  try {
    await updateClientWork(id, data)
  } catch (err) {
    return { error: err.message || 'Could not save. Please try again.' }
  }
  await cleanupReplacedImages(previous, data)

  await logActivity('Client work updated', name)
  revalidateAll()
  return { success: true }
}

export async function deleteClientWorkAction(formData) {
  const id = formData.get('id')?.toString()
  if (!id) return

  const entry = (await getClientWork()).find((w) => w.id === id)
  await deleteClientWork(id)
  if (entry) await cleanupAllImages(entry)
  await logActivity('Client work deleted', id)
  revalidateAll()
}

export async function reorderClientWorkAction(formData) {
  const id = formData.get('id')?.toString()
  const direction = formData.get('direction')?.toString()
  if (!id || !direction) return

  await reorderClientWork(id, direction)
  revalidateAll()
}
