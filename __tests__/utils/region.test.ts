import { getRecommendedMethod } from '@/utils/region'

describe('utils/region', () => {
  describe('getRecommendedMethod', () => {
    it('maps New York to NorthAmerica', () => {
      expect(getRecommendedMethod(40.7128, -74.006)).toBe('NorthAmerica')
    })

    it('maps London to MuslimWorldLeague', () => {
      expect(getRecommendedMethod(51.5074, -0.1278)).toBe('MuslimWorldLeague')
    })

    it('maps Makkah to UmmAlQura', () => {
      expect(getRecommendedMethod(21.4225, 39.8262)).toBe('UmmAlQura')
    })

    it('maps Cairo to Egyptian', () => {
      expect(getRecommendedMethod(30.0444, 31.2357)).toBe('Egyptian')
    })

    it('maps Jakarta to Singapore', () => {
      expect(getRecommendedMethod(-6.2088, 106.8456)).toBe('Singapore')
    })

    it('maps Karachi to Karachi', () => {
      expect(getRecommendedMethod(24.8607, 67.0011)).toBe('Karachi')
    })

    it('maps Istanbul to Turkey', () => {
      expect(getRecommendedMethod(41.0082, 28.9784)).toBe('Turkey')
    })

    it('maps Casablanca to Morocco', () => {
      expect(getRecommendedMethod(33.5731, -7.5898)).toBe('Morocco')
    })

    it('defaults ocean coordinates to MuslimWorldLeague', () => {
      // Middle of Pacific Ocean
      expect(getRecommendedMethod(0, -170)).toBe('MuslimWorldLeague')
    })

    it('defaults equator/unmapped regions to MuslimWorldLeague', () => {
      // South America (not explicitly mapped)
      expect(getRecommendedMethod(-15, -47)).toBe('MuslimWorldLeague')
    })

    it('defaults polar regions to MuslimWorldLeague', () => {
      // Antarctica
      expect(getRecommendedMethod(-80, 0)).toBe('MuslimWorldLeague')
    })
  })
})
