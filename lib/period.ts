export const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
]

// "YYYY-MM" → year + month-centered fraction, e.g. "2013-04" → 2013.29
export function toFractionalYear(value: string): number {
  const [year, month] = value.split("-").map(Number)
  return year + (month - 0.5) / 12
}

export function formatYearMonth(value: string): string {
  const [year, month] = value.split("-").map(Number)
  return `${MONTHS[month - 1]} ${year}`
}

export function formatPeriod(start: string, end: string | null): string {
  return `${formatYearMonth(start)} — ${end ? formatYearMonth(end) : "Now"}`
}
