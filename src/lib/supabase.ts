import { createClient } from '@supabase/supabase-js'
import type { Pedal } from './types'

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL ?? ''
const supabaseKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY ?? ''

export const supabase = createClient(supabaseUrl, supabaseKey)

export async function getPedales(): Promise<Pedal[]> {
  const { data, error } = await supabase
    .from('pedales')
    .select('*')
    .order('category')
    .order('name')

  if (error) {
    console.error('Error fetching pedales:', error)
    return []
  }

  return data ?? []
}

export async function getPedalBySlug(slug: string): Promise<Pedal | null> {
  const { data, error } = await supabase
    .from('pedales')
    .select('*')
    .eq('slug', slug)
    .single()

  if (error) {
    console.error('Error fetching pedal:', error)
    return null
  }

  return data
}

export async function getPedalesByCategory(category: string): Promise<Pedal[]> {
  const { data, error } = await supabase
    .from('pedales')
    .select('*')
    .eq('category', category)
    .order('name')

  if (error) {
    console.error('Error fetching pedales by category:', error)
    return []
  }

  return data ?? []
}
