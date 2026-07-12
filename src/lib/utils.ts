export function formatPrice(amount: number): string {
  return `$${amount.toLocaleString('es-CL')}`
}

export function formatPriceRange(floor: number, optimistic: number): string {
  return `${formatPrice(floor)} — ${formatPrice(optimistic)}`
}

export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

export function getConditionLabel(condition: string, detail: string): string {
  const parts = [condition]
  if (detail) parts.push(detail)
  return parts.join(' · ')
}

export function getConditionColor(condition: string): 'mint' | 'box' | 'warn' | 'repair' | 'neutral' {
  const c = condition.toLowerCase()
  if (c === 'mint') return 'mint'
  if (c.includes('caja') || c.includes('buen estado') || c.includes('muy bueno')) return 'box'
  if (c.includes('reparar')) return 'repair'
  if (c.includes('detalles') || c.includes('marcas') || c.includes('uso')) return 'warn'
  return 'neutral'
}

export function getCategoryPath(categorySlug: string): string {
  return `/categoria/${categorySlug}`
}

export function getPedalPath(pedalSlug: string): string {
  return `/catalogo/${pedalSlug}`
}
