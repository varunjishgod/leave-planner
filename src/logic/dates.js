// Small pure helpers for "YYYY-MM-DD" date strings. No React here.
// We read dates in UTC so the user's time zone can never shift a date by one day.

// Weekday names in the order JavaScript numbers them (getUTCDay: 0 = Sunday).
// Also used as the keys of timetable.json.
export const WEEKDAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']
const MONTHS = [
  'JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE',
  'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER',
]

// "2026-11-18" → a Date at midnight UTC on that day
export function toDate(dateString) {
  return new Date(dateString + 'T00:00:00Z')
}

// A Date → "2026-11-18" (the first 10 characters of its UTC ISO text)
export function toDateString(date) {
  return date.toISOString().slice(0, 10)
}

// "2026-11-18" → 18
export function dayOfMonth(dateString) {
  return toDate(dateString).getUTCDate()
}

// "2026-11-18" → "WED"
export function weekdayName(dateString) {
  return WEEKDAYS[toDate(dateString).getUTCDay()]
}

// "2026-11-18" → "NOVEMBER 2026"
export function monthLabel(dateString) {
  const date = toDate(dateString)
  return MONTHS[date.getUTCMonth()] + ' ' + date.getUTCFullYear()
}

// Split days into month groups, newest first (like sastranet's day-wise list).
// Returns [{ label: "DECEMBER 2026", days: [...] }, ...]. The input array is not changed.
export function groupByMonthNewestFirst(days) {
  const newestFirst = [...days].reverse()
  const groups = []

  for (const day of newestFirst) {
    const label = monthLabel(day.date)
    const lastGroup = groups[groups.length - 1]

    if (lastGroup && lastGroup.label === label) {
      lastGroup.days.push(day)
    } else {
      groups.push({ label: label, days: [day] })
    }
  }

  return groups
}
