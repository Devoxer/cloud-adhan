import type { CalculationMethod } from '@/types/prayer'

type RegionBounds = {
  latMin: number
  latMax: number
  lngMin: number
  lngMax: number
  method: CalculationMethod
}

// Ordered from most specific to most general — Turkey checked before Europe
// since Turkey overlaps with both Europe and Middle East bounding boxes
const REGION_BOUNDS: RegionBounds[] = [
  { latMin: 36, latMax: 42, lngMin: 26, lngMax: 45, method: 'Turkey' },
  { latMin: 27, latMax: 36, lngMin: -13, lngMax: -1, method: 'Morocco' },
  { latMin: 15, latMax: 37, lngMin: -17, lngMax: 34, method: 'Egyptian' },
  { latMin: 12, latMax: 42, lngMin: 34, lngMax: 60, method: 'UmmAlQura' },
  { latMin: 5, latMax: 37, lngMin: 60, lngMax: 97, method: 'Karachi' },
  { latMin: -11, latMax: 20, lngMin: 95, lngMax: 141, method: 'Singapore' },
  { latMin: 35, latMax: 72, lngMin: -25, lngMax: 45, method: 'MuslimWorldLeague' },
  { latMin: 15, latMax: 72, lngMin: -170, lngMax: -50, method: 'NorthAmerica' },
]

export function getRecommendedMethod(latitude: number, longitude: number): CalculationMethod {
  for (const region of REGION_BOUNDS) {
    if (
      latitude >= region.latMin &&
      latitude <= region.latMax &&
      longitude >= region.lngMin &&
      longitude <= region.lngMax
    ) {
      return region.method
    }
  }
  return 'MuslimWorldLeague'
}
