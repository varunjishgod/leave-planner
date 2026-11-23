// App-wide settings. Change values here, never inside components or logic.

// Minimum attendance (in %) each subject must keep.
export const THRESHOLD = 75

// "Today" is fixed so the demo always looks the same (day 55 of 82, just after CIA II).
// Days before TODAY are past (already marked present/absent, in days.json).
// TODAY and later are upcoming (generated from the timetable; can be planned as leave).
// Semester dates, holidays, working Saturdays and CIA days live in data/calendar.json.
export const TODAY = '2026-09-21'
