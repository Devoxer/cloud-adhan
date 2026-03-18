import type { CalculationMethod } from '@/types/prayer'

export type CalculationMethodInfo = {
  key: CalculationMethod
  displayName: string
  description: string
  regions: string[]
}

export const CALCULATION_METHODS: Record<CalculationMethod, CalculationMethodInfo> = {
  MuslimWorldLeague: {
    key: 'MuslimWorldLeague',
    displayName: 'Muslim World League',
    description: 'Fajr 18°, Isha 17° — widely used in Europe, Far East, and parts of the Americas',
    regions: ['Europe', 'Far East', 'Parts of Americas'],
  },
  Egyptian: {
    key: 'Egyptian',
    displayName: 'Egyptian General Authority',
    description: 'Fajr 19.5°, Isha 17.5° — used in Africa, Syria, Lebanon, and Malaysia',
    regions: ['North Africa', 'Africa', 'Syria', 'Lebanon', 'Malaysia'],
  },
  Karachi: {
    key: 'Karachi',
    displayName: 'University of Islamic Sciences, Karachi',
    description: 'Fajr 18°, Isha 18° — used in Pakistan, Bangladesh, India, and Afghanistan',
    regions: ['South Asia', 'Pakistan', 'Bangladesh', 'India', 'Afghanistan'],
  },
  UmmAlQura: {
    key: 'UmmAlQura',
    displayName: 'Umm Al-Qura University, Makkah',
    description: 'Fajr 18.5°, Isha 90min after Maghrib — used in the Arabian Peninsula',
    regions: ['Gulf', 'Saudi Arabia', 'Arabian Peninsula'],
  },
  Dubai: {
    key: 'Dubai',
    displayName: 'Dubai',
    description: 'Fajr 18.2°, Isha 18.2° — used in the UAE',
    regions: ['UAE', 'Gulf'],
  },
  MoonsightingCommittee: {
    key: 'MoonsightingCommittee',
    displayName: 'Moonsighting Committee',
    description: 'Fajr 18°, Isha 18° — uses shafaq-based Isha calculation',
    regions: ['Global', 'Moonsighting Communities'],
  },
  NorthAmerica: {
    key: 'NorthAmerica',
    displayName: 'Islamic Society of North America (ISNA)',
    description: 'Fajr 15°, Isha 15° — used in the USA and Canada',
    regions: ['North America', 'USA', 'Canada'],
  },
  Kuwait: {
    key: 'Kuwait',
    displayName: 'Kuwait',
    description: 'Fajr 18°, Isha 17.5° — used in Kuwait',
    regions: ['Kuwait', 'Gulf'],
  },
  Qatar: {
    key: 'Qatar',
    displayName: 'Qatar',
    description: 'Fajr 18°, Isha 90min after Maghrib — used in Qatar',
    regions: ['Qatar', 'Gulf'],
  },
  Singapore: {
    key: 'Singapore',
    displayName: 'Majlis Ugama Islam Singapura',
    description: 'Fajr 20°, Isha 18° — used in Singapore, Indonesia, and Southeast Asia',
    regions: ['Southeast Asia', 'Singapore', 'Indonesia', 'Malaysia'],
  },
  Tehran: {
    key: 'Tehran',
    displayName: 'Institute of Geophysics, University of Tehran',
    description: 'Fajr 17.7°, Isha 14° — used in Iran and some Shia communities',
    regions: ['Iran', 'Shia Communities'],
  },
  Turkey: {
    key: 'Turkey',
    displayName: 'Diyanet İşleri Başkanlığı, Turkey',
    description: 'Fajr 18°, Isha 17° — used in Turkey and the Balkans',
    regions: ['Turkey', 'Balkans'],
  },
  Morocco: {
    key: 'Morocco',
    displayName: 'Ministry of Habous, Morocco',
    description: 'Fajr 19°, Isha 17° — used in Morocco',
    regions: ['Morocco'],
  },
}
