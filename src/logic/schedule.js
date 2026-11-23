// Builds working days from the weekly timetable and the academic calendar.
// Pure functions, no React.
import { WEEKDAYS, toDate, toDateString } from './dates.js'

// Decide what kind of day a date is, using the academic calendar.
// Returns one of:
//   { kind: 'exam', name }        working day, but only exams (CIA): no classes
//   { kind: 'classes', follows }  working day; `follows` = which weekday's timetable to use
//   { kind: 'off' }               holiday, Sunday or non-working Saturday
export function dayType(date, calendar) {
  const exam = calendar.examDays.find((d) => d.date === date)
  if (exam) {
    return { kind: 'exam', name: exam.name }
  }

  const isHoliday = calendar.holidays.some((d) => d.date === date)
  if (isHoliday) {
    return { kind: 'off' }
  }

  const weekday = WEEKDAYS[toDate(date).getUTCDay()]

  if (weekday === 'SUN') {
    return { kind: 'off' }
  }

  // Saturdays are off unless the calendar says "follow <weekday>'s timetable".
  if (weekday === 'SAT') {
    const saturday = calendar.workingSaturdays.find((d) => d.date === date)
    if (saturday) {
      return { kind: 'classes', follows: saturday.follows }
    }
    return { kind: 'off' }
  }

  return { kind: 'classes', follows: weekday }
}

// Walk one day at a time from fromDate to endDate (both included) and return
// every working day in the same shape as days.json:
//   { date, periods: [{ number, courseCode, status: "upcoming" }] }
// plus `follows` on working Saturdays (e.g. "MON") and `exam` on CIA days (no periods).
export function generateDays(timetable, calendar, fromDate, endDate) {
  const result = []
  const current = toDate(fromDate)
  const end = toDate(endDate)

  while (current <= end) {
    const date = toDateString(current)
    const type = dayType(date, calendar)

    if (type.kind === 'exam') {
      result.push({ date: date, exam: type.name, periods: [] })
    }

    if (type.kind === 'classes') {
      const slots = timetable[type.follows] || []
      const day = {
        date: date,
        periods: slots.map((slot) => ({
          number: slot.number,
          courseCode: slot.courseCode,
          status: 'upcoming',
        })),
      }
      // Only Saturdays need a note about which timetable they follow.
      if (type.follows !== WEEKDAYS[current.getUTCDay()]) {
        day.follows = type.follows
      }
      result.push(day)
    }

    // Move to the next day. `current` is our own local Date, so changing it is fine.
    current.setUTCDate(current.getUTCDate() + 1)
  }

  return result
}
