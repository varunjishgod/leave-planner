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
// The planner never edits the real data. It only keeps a list of "planned keys",
// one string per period you plan to skip, e.g. "2026-11-25#3".

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

// Make a copy of the days where every planned upcoming period has status "planned".
// The original days array (the real data) stays exactly the same.
export function applyPlan(days, plannedKeys) {
  return days.map((day) => ({
    ...day,
    periods: day.periods.map((period) => {
      const isPlanned = plannedKeys.includes(periodKey(day.date, period.number))
      if (isPlanned && period.status === 'upcoming') {
        return { ...period, status: 'planned' }
      }
      return period
    }),
  }))
}

// Plan or unplan a whole day.
// Only classes that have not happened yet (upcoming or already planned) are affected.
// If every one of them is already planned, the whole day is removed from the plan;
// otherwise the missing ones are added. Returns a NEW list.
export function toggleDay(plannedKeys, day) {
  const futureKeys = []
  for (const period of day.periods) {
    if (period.status === 'upcoming' || period.status === 'planned') {
      futureKeys.push(periodKey(day.date, period.number))
    }
  }

  const allPlanned = futureKeys.every((key) => plannedKeys.includes(key))

  if (allPlanned) {
    return plannedKeys.filter((key) => !futureKeys.includes(key))
  }

  const missingKeys = futureKeys.filter((key) => !plannedKeys.includes(key))
  return [...plannedKeys, ...missingKeys]
}
