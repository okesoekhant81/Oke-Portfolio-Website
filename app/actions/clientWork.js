'use server'

import { revalidatePath } from 'next/cache'
import { addClientWork, updateClientWork, deleteClientWork, reorderClientWork, getClientWork } from '../../lib/content/clientWork'
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

  try {
    await updateClientWork(id, {
      name,
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

  await logActivity('Client work updated', name)
  revalidateAll()
  return { success: true }
}

export async function deleteClientWorkAction(formData) {
  const id = formData.get('id')?.toString()
  if (!id) return

  await deleteClientWork(id)
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

// One-time import of the first batch of case studies, typed up from the
// client's own notes — faster than re-typing 7 bilingual entries through
// the form above. Skips any name already present so it's safe to click more
// than once by accident. Remove this + the button on /admin/client-work
// once it's been run.
const SEED_ENTRIES = [
  {
    name: 'Mangoon Restaurant',
    scope: 'Branding & Digital Marketing — Full Scope',
    scopeMy: 'Brand ဖန်တီးမှုနှင့် Digital Marketing — အကုန်လုံး',
    description:
      'Set brand and go-to-market strategy, built the brand, and ran digital marketing strategy and implementation — including e-commerce setup across Noon, Keeta, Talabat, Careem, and Smiles, plus ongoing performance marketing.',
    descriptionMy:
      'Brand နှင့် Go-to-Market Strategy ချမှတ်ပြီး Branding တည်ဆောက်ခဲ့သည်။ Digital Marketing Strategy နှင့် Implementation (Noon, Keeta, Talabat, Careem, Smiles ပေါ်တွင် E-commerce Setup အပါအဝင်) နှင့် Performance Marketing ကိုပါ ဆက်လက်လုပ်ဆောင်ပေးခဲ့သည်။',
    highlight: 'Monthly sales grew from AED 800 to AED 3,500+, with 80% customer retention.',
    highlightMy: 'လစဉ်အရောင်း AED 800 မှ AED 3,500+ အထိ တိုးတက်လာပြီး Customer Retention 80% ရရှိခဲ့သည်။',
  },
  {
    name: 'Langosh Food Truck',
    scope: 'Branding',
    scopeMy: 'Branding',
    description:
      'Led the brand from the ground up for launch — brand strategy through food truck design — working with a cross-functional team through to delivery.',
    descriptionMy:
      'Launch အတွက် Brand Strategy မှ Food Truck Design အထိ အစအဆုံး ဦးဆောင်ပြီး Cross-Functional Team နှင့် အတူ Delivery အထိ လုပ်ဆောင်ပေးခဲ့သည်။',
    highlight: '',
    highlightMy: '',
  },
  {
    name: 'Mandalay Bay Travel & Tour',
    scope: 'Branding & Digital Marketing — Full Scope',
    scopeMy: 'Brand ဖန်တီးမှုနှင့် Digital Marketing — အကုန်လုံး',
    description: 'Branding and full-scope digital marketing for this UAE-based travel and tour business.',
    descriptionMy: 'UAE အခြေစိုက် Travel and Tour လုပ်ငန်းအတွက် Branding နှင့် Digital Marketing အပြည့်အစုံ လုပ်ဆောင်ပေးခဲ့သည်။',
    highlight: '',
    highlightMy: '',
  },
  {
    name: 'Nang Beyond Property',
    scope: 'Digital Marketing — Full Scope',
    scopeMy: 'Digital Marketing — အကုန်လုံး',
    description: 'Strengthened brand presence through ongoing brand strategy, marketing strategy, and implementation.',
    descriptionMy:
      'Brand Strategy၊ Marketing Strategy နှင့် Implementation တို့ဖြင့် Brand Presence ပိုမိုအားကောင်းလာအောင် လုပ်ဆောင်ပေးခဲ့သည်။',
    highlight: '',
    highlightMy: '',
  },
  {
    name: 'Ace of Data',
    scope: 'Digital Marketing',
    scopeMy: 'Digital Marketing',
    description: 'Brand strategy, marketing strategy, and implementation for this data-focused business.',
    descriptionMy: 'Data အခြေပြု လုပ်ငန်းအတွက် Brand Strategy၊ Marketing Strategy နှင့် Implementation လုပ်ဆောင်ပေးခဲ့သည်။',
    highlight: 'Cut monthly ad spend from MMK 7.5M to MMK 200K while growing revenue generated to roughly MMK 35M/month.',
    highlightMy:
      'လစဉ် Ads Budget ကျပ် ၇.၅ သန်းမှ ၂ သိန်းအထိ လျှော့ချနိုင်ခဲ့ပြီး၊ ရရှိငွေကြေးကို လစဉ် ကျပ် ၃၅ သန်းအထိ တိုးတက်စေခဲ့သည်။',
  },
  {
    name: 'Ivory Luxe Salon',
    scope: 'Branding & Digital Marketing',
    scopeMy: 'Branding နှင့် Digital Marketing',
    description: 'Brand strategy, marketing strategy, and implementation.',
    descriptionMy: 'Brand Strategy၊ Marketing Strategy နှင့် Implementation လုပ်ဆောင်ပေးခဲ့သည်။',
    highlight: 'Monthly revenue grew from AED 8,000 to AED 30,000+.',
    highlightMy: 'လစဉ်ဝင်ငွေ AED 8,000 မှ AED 30,000+ အထိ တိုးတက်လာခဲ့သည်။',
  },
  {
    name: 'Duzo Restaurant (Taste Of Asia)',
    scope: 'Branding & Digital Marketing — Full Scope',
    scopeMy: 'Brand ဖန်တီးမှုနှင့် Digital Marketing — အကုန်လုံး',
    description:
      'Set brand and go-to-market strategy, including POSM. Built the brand and ran digital marketing strategy and implementation — including e-commerce setup across Noon, Keeta, Talabat, Careem, and Smiles, plus performance marketing.',
    descriptionMy:
      'POSM အပါအဝင် Brand နှင့် Go-to-Market Strategy ချမှတ်ပြီး Branding တည်ဆောက်ခဲ့သည်။ Digital Marketing Strategy နှင့် Implementation (Noon, Keeta, Talabat, Careem, Smiles ပေါ်တွင် E-commerce Setup အပါအဝင်) နှင့် Performance Marketing ကိုပါ လုပ်ဆောင်ပေးခဲ့သည်။',
    highlight: '',
    highlightMy: '',
  },
]

export async function seedClientWorkAction() {
  const existing = await getClientWork()
  const existingNames = new Set(existing.map((w) => w.name))
  const toAdd = SEED_ENTRIES.filter((e) => !existingNames.has(e.name))

  for (const entry of toAdd) {
    await addClientWork(entry)
  }

  await logActivity('Client work seeded', `${toAdd.length} added, ${SEED_ENTRIES.length - toAdd.length} skipped`)
  revalidateAll()
  return { addedCount: toAdd.length, skippedCount: SEED_ENTRIES.length - toAdd.length }
}
