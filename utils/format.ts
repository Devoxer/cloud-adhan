import dayjs from 'dayjs'

const ARABIC_INDIC_DIGITS = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩']

const AM_PM_AR: Record<string, string> = { AM: 'ص', PM: 'م' }

export function formatNumber(value: number | string, useArabicNumerals: boolean): string {
  const str = String(value)
  if (!useArabicNumerals) return str
  return str.replace(/[0-9]/g, (d) => ARABIC_INDIC_DIGITS[Number(d)])
}

export function formatTime(date: Date, use24Hour = false, useArabicNumerals = false): string {
  const format = use24Hour ? 'HH:mm' : 'h:mm A'
  let formatted = dayjs(date).format(format)
  if (useArabicNumerals) {
    formatted = formatted.replace(/AM|PM/, (m) => AM_PM_AR[m] ?? m)
    return formatNumber(formatted, true)
  }
  return formatted
}
