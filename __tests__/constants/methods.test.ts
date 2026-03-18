import { CALCULATION_METHODS } from '@/constants/methods'
import type { CalculationMethod } from '@/types/prayer'

const ALL_METHODS: CalculationMethod[] = [
  'MuslimWorldLeague',
  'Egyptian',
  'Karachi',
  'UmmAlQura',
  'Dubai',
  'MoonsightingCommittee',
  'NorthAmerica',
  'Kuwait',
  'Qatar',
  'Singapore',
  'Tehran',
  'Turkey',
  'Morocco',
]

describe('constants/methods', () => {
  it('defines all 13 calculation methods', () => {
    expect(Object.keys(CALCULATION_METHODS)).toHaveLength(13)
  })

  it('has an entry for every CalculationMethod type value', () => {
    for (const method of ALL_METHODS) {
      expect(CALCULATION_METHODS[method]).toBeDefined()
    }
  })

  it.each(ALL_METHODS)('%s has required fields', (method) => {
    const info = CALCULATION_METHODS[method]
    expect(info.key).toBe(method)
    expect(typeof info.displayName).toBe('string')
    expect(info.displayName.length).toBeGreaterThan(0)
    expect(typeof info.description).toBe('string')
    expect(info.description.length).toBeGreaterThan(0)
    expect(Array.isArray(info.regions)).toBe(true)
    expect(info.regions.length).toBeGreaterThan(0)
  })

  it('maps ISNA to North America region', () => {
    expect(CALCULATION_METHODS.NorthAmerica.regions).toContain('North America')
  })

  it('maps MWL to Europe region', () => {
    expect(CALCULATION_METHODS.MuslimWorldLeague.regions).toContain('Europe')
  })

  it('maps UmmAlQura to Gulf region', () => {
    expect(CALCULATION_METHODS.UmmAlQura.regions).toContain('Gulf')
  })

  it('maps Egyptian to North Africa region', () => {
    expect(CALCULATION_METHODS.Egyptian.regions).toContain('North Africa')
  })

  it('maps Morocco to Morocco region', () => {
    expect(CALCULATION_METHODS.Morocco.regions).toContain('Morocco')
  })

  it('maps Singapore to Indonesia/Southeast Asia', () => {
    const regions = CALCULATION_METHODS.Singapore.regions
    expect(
      regions.some((r) => r.includes('Southeast Asia') || r.includes('Indonesia')),
    ).toBe(true)
  })
})
