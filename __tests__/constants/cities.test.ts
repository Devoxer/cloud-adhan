import { CITIES } from '@/constants/cities'

describe('constants/cities - City data integrity', () => {
  it('contains at least 200 cities', () => {
    expect(CITIES.length).toBeGreaterThanOrEqual(200)
  })

  it('has all required fields for every city', () => {
    for (const city of CITIES) {
      expect(city.key).toBeTruthy()
      expect(typeof city.key).toBe('string')
      expect(city.name).toBeTruthy()
      expect(typeof city.name).toBe('string')
      expect(city.country).toBeTruthy()
      expect(typeof city.country).toBe('string')
      expect(city.countryCode).toBeTruthy()
      expect(typeof city.countryCode).toBe('string')
      expect(city.countryCode).toHaveLength(2)
      expect(typeof city.latitude).toBe('number')
      expect(typeof city.longitude).toBe('number')
    }
  })

  it('has no duplicate keys', () => {
    const keys = CITIES.map((c) => c.key)
    const uniqueKeys = new Set(keys)
    expect(uniqueKeys.size).toBe(keys.length)
  })

  it('has valid latitude range [-90, 90] for all cities', () => {
    for (const city of CITIES) {
      expect(city.latitude).toBeGreaterThanOrEqual(-90)
      expect(city.latitude).toBeLessThanOrEqual(90)
    }
  })

  it('has valid longitude range [-180, 180] for all cities', () => {
    for (const city of CITIES) {
      expect(city.longitude).toBeGreaterThanOrEqual(-180)
      expect(city.longitude).toBeLessThanOrEqual(180)
    }
  })

  it('is sorted alphabetically by name', () => {
    for (let i = 1; i < CITIES.length; i++) {
      const prev = CITIES[i - 1].name.toLowerCase()
      const curr = CITIES[i].name.toLowerCase()
      expect(curr >= prev).toBe(true)
    }
  })

  it('contains key Muslim cities', () => {
    const cityNames = CITIES.map((c) => c.name)
    expect(cityNames).toContain('Makkah')
    expect(cityNames).toContain('Medina')
    expect(cityNames).toContain('Cairo')
    expect(cityNames).toContain('Istanbul')
    expect(cityNames).toContain('Casablanca')
    expect(cityNames).toContain('Jakarta')
    expect(cityNames).toContain('Karachi')
    expect(cityNames).toContain('Dhaka')
    expect(cityNames).toContain('Riyadh')
    expect(cityNames).toContain('Dubai')
  })
})
