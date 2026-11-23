// Builds the upcoming days from the weekly timetable. Pure function, no React.
import { WEEKDAYS, toDate, toDateString } from './dates.js'

// Walk one day at a time from fromDate to endDate (both included).
// A day gets classes only if the timetable has periods for that weekday
// and the date is not a holiday. Every period starts as "upcoming".
// Returns days in the same shape as days.json: [{ date, periods: [...] }].
export function generateFutureDays(timetable, holidays, fromDate, endDate) {
  const holidayDates = holidays.map((holiday) => holiday.date)
  const result = []

  const current = toDate(fromDate)
  const end = toDate(endDate)

  while (current <= end) {
    const date = toDateString(current)
    const slots = timetable[WEEKDAYS[current.getUTCDay()]]
    const hasClasses = slots !== undefined && slots.length > 0

    if (hasClasses && !holidayDates.includes(date)) {
      result.push({
        date: date,
        periods: slots.map((slot) => ({
          number: slot.number,
          courseCode: slot.courseCode,
          status: 'upcoming',
        })),
      })
    }

    // Move to the next day. `current` is our own local Date, so changing it is fine.
    current.setUTCDate(current.getUTCDate() + 1)
  }

  return result
}
