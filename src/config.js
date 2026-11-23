// App-wide settings. Change values here, never inside components or logic.

// Minimum attendance (in %) each subject must keep.
export const THRESHOLD = 75

// "Today" is fixed so the demo always looks the same.
// Days before TODAY are past (already marked present/absent).
// TODAY and later are upcoming (can be planned as leave).
export const TODAY = '2026-11-23'

// Last working day of the semester. Upcoming days are generated
// from TODAY up to and including this date (see src/logic/schedule.js).
export const SEMESTER_END = '2026-12-11'
