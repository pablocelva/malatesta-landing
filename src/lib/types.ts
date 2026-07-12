export interface Pedal {
  id: string
  name: string
  slug: string
  category: string
  category_emoji: string
  type: string
  typology: string
  tags: string[]
  rarity: string
  condition: string
  condition_detail: string
  price: number
  price_floor: number
  price_optimistic: number
  in_use: boolean
  available: boolean
  image_url: string
  notes: string
  created_at: string
  updated_at: string
}

export interface Category {
  name: string
  emoji: string
  slug: string
  count: number
}

export type RarityLevel = '💎' | '🔷' | '🔹' | ''

export const RARITY_LABELS: Record<string, string> = {
  '💎': 'Ultra raro',
  '🔷': 'Raro',
  '🔹': 'Poco común',
  '': 'Común',
}

export const CATEGORY_META: Record<string, { name: string; emoji: string }> = {
  booster: { name: 'Booster', emoji: '🟢' },
  compresor: { name: 'Compresor', emoji: '🔵' },
  overdrive: { name: 'Clean OD / Overdrive', emoji: '🟠' },
  preamp: { name: 'Preamp', emoji: '🟢' },
  distorsion: { name: 'Distorsión', emoji: '🔴' },
  fuzz: { name: 'Fuzz', emoji: '🟣' },
  modulacion: { name: 'Modulación', emoji: '🟦' },
  'delay-reverb': { name: 'Delay / Reverb', emoji: '🟡' },
  'pitch-wah': { name: 'Pitch / Expresión / Wah', emoji: '🟤' },
  'multi-fx': { name: 'Multi FX y Otros', emoji: '⚫' },
}

export const CATEGORY_SLUGS = Object.keys(CATEGORY_META)
