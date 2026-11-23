// All attendance maths lives here.
// These are "pure functions": they only use their inputs, return a new value,
// and never change the data passed in. No React in this file.

// Count how many periods have each status.
// If courseCode is given, only that course's periods are counted;
// if it is left out, every period of every course is counted (overall).
export function countStatuses(days, courseCode) {
  const counts = { present: 0, absent: 0, upcoming: 0, planned: 0 }

  for (const day of days) {
    for (const period of day.periods) {
      const isWantedCourse = courseCode === undefined || period.courseCode === courseCode
      if (isWantedCourse) {
        counts[period.status] = counts[period.status] + 1
      }
    }
  }

  return counts
}

// Attendance % = present / total × 100.
// A course with no classes yet counts as 100%: you have not missed anything,
// so it should not show as "below threshold".
export function percentage(present, total) {
  if (total === 0) {
    return 100
  }
  return (present / total) * 100
}

// True when a percentage is under the minimum (used to show red warnings).
export function isBelowThreshold(percent, threshold) {
  return percent < threshold
}

// Which colour band a percentage falls in:
//   "good"    (green)  — at or above safeLevel, e.g. 80% and up
//   "warning" (yellow) — at or above threshold but below safeLevel, e.g. 75% to 79.99%
//   "danger"  (red)    — below threshold, e.g. under 75%
export function attendanceTone(percent, threshold, safeLevel) {
  if (percent < threshold) {
    return 'danger'
  }
  if (percent < safeLevel) {
    return 'warning'
  }
  return 'good'
}

// Attendance as it stands today: only classes that already happened.
export function currentStats(counts) {
  const total = counts.present + counts.absent
  return {
    present: counts.present,
    absent: counts.absent,
    total: total,
    percent: percentage(counts.present, total),
  }
}

// Attendance at the end of the semester if you follow your plan:
// every upcoming class you did NOT plan to skip counts as present,
// every planned class counts as absent.
export function projectedStats(counts) {
  const present = counts.present + counts.upcoming
  const absent = counts.absent + counts.planned
  const total = present + absent
  return {
    present: present,
    absent: absent,
    total: total,
    percent: percentage(present, total),
  }
}

// Every class in the whole semester (past + future).
export function semesterTotal(counts) {
  return counts.present + counts.absent + counts.upcoming + counts.planned
}

// The most absences allowed in the whole semester while staying at or above the threshold.
// You must attend at least threshold% of the classes, so you may miss (100 - threshold)%.
// Rounded down, because missing part of a class is not possible and rounding up would drop you below.
export function allowedBunks(totalBySemEnd, threshold) {
  return Math.floor((totalBySemEnd * (100 - threshold)) / 100)
}

// ---------- Planner (sandbox) helpers ----------
// The planner never edits the base data. It only keeps a list of "planned keys",
// one string per lecture you mark absent, e.g. "2026-09-25#3".

// Build the key for one period: date + "#" + period number.
export function periodKey(date, periodNumber) {
  return date + '#' + periodNumber
}

// Add the key if it is not in the list, remove it if it is.
// Returns a NEW list; the old list is not changed.
export function togglePeriod(plannedKeys, key) {
  if (plannedKeys.includes(key)) {
    return plannedKeys.filter((k) => k !== key)
  }
  return [...plannedKeys, key]
}

// A lecture you can mark absent: one that is present now (or already marked, so you can undo it).
export function canMark(period) {
  return period.status === 'present' || period.status === 'planned'
}

// Make a copy of the days where every marked lecture has status "planned" (counts as absent).
// The original days array stays exactly the same.
export function applyPlan(days, plannedKeys) {
  return days.map((day) => ({
    ...day,
    periods: day.periods.map((period) => {
      const isPlanned = plannedKeys.includes(periodKey(day.date, period.number))
      if (isPlanned && period.status === 'present') {
        return { ...period, status: 'planned' }
      }
      return period
    }),
  }))
}

// Mark or unmark a whole day.
// If every lecture of the day is already marked, the whole day is unmarked;
// otherwise the missing ones are added. Returns a NEW list.
export function toggleDay(plannedKeys, day) {
  const dayKeys = []
  for (const period of day.periods) {
    if (canMark(period)) {
      dayKeys.push(periodKey(day.date, period.number))
    }
  }

  const allPlanned = dayKeys.every((key) => plannedKeys.includes(key))

  if (allPlanned) {
    return plannedKeys.filter((key) => !dayKeys.includes(key))
  }

  const missingKeys = dayKeys.filter((key) => !plannedKeys.includes(key))
  return [...plannedKeys, ...missingKeys]
}
