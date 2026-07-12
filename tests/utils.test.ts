import { describe, it, expect } from 'vitest'
import { formatPrice, generateSlug, getConditionLabel, formatPriceRange } from '../src/lib/utils'

describe('formatPrice', () => {
  it('formats zero', () => {
    expect(formatPrice(0)).toBe('$0')
  })

  it('formats small amounts', () => {
    expect(formatPrice(25000)).toBe('$25.000')
  })

  it('formats large amounts', () => {
    expect(formatPrice(550000)).toBe('$550.000')
  })

  it('formats millions', () => {
    expect(formatPrice(1000000)).toBe('$1.000.000')
  })
})

describe('formatPriceRange', () => {
  it('formats a range', () => {
    expect(formatPriceRange(150000, 220000)).toBe('$150.000 — $220.000')
  })
})

describe('generateSlug', () => {
  it('generates slug from simple name', () => {
    expect(generateSlug('Boss DM-2W')).toBe('boss-dm-2w')
  })

  it('handles special characters', () => {
    expect(generateSlug('MXR Phase 90')).toBe('mxr-phase-90')
  })

  it('normalizes accents', () => {
    expect(generateSlug('Distorsión')).toBe('distorsion')
  })

  it('removes leading/trailing hyphens', () => {
    expect(generateSlug('  Hello World  ')).toBe('hello-world')
  })

  it('collapses multiple hyphens', () => {
    expect(generateSlug('a---b')).toBe('a-b')
  })
})

describe('getConditionLabel', () => {
  it('returns condition only when no detail', () => {
    expect(getConditionLabel('MINT', '')).toBe('MINT')
  })

  it('joins condition and detail', () => {
    expect(getConditionLabel('MINT', 'Con caja')).toBe('MINT · Con caja')
  })
})
