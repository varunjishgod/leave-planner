// App-wide settings. Change values here, never inside components or logic.

// Minimum attendance (in %) each subject must keep.
export const THRESHOLD = 75

// "Today" is fixed so the demo always looks the same. It is only used for the
// TODAY label in the day list: every lecture in the semester starts as present
// and any of them can be marked absent.
// Semester dates, holidays, working Saturdays and CIA days live in data/calendar.json.
export const TODAY = '2026-09-21'
