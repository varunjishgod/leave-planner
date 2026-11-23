// App-wide settings. Change values here, never inside components or logic.

// Minimum attendance (in %) each subject must keep. Below this: red.
export const THRESHOLD = 75

// At or above this %, attendance is shown green ("safe").
// Between THRESHOLD and SAFE_LEVEL it is shown yellow ("careful").
export const SAFE_LEVEL = 80

// "Today" is fixed so the demo always looks the same. It is only used for the
// TODAY label in the day list: every lecture in the semester starts as present
// and any of them can be marked absent.
// Semester dates, holidays, working Saturdays and CIA days live in data/calendar.json.
export const TODAY = '2026-09-21'
