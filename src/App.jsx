import { useState } from 'react'
import './App.css'
import courses from './data/courses.json'
import timetable from './data/timetable.json'
import calendar from './data/calendar.json'
import { THRESHOLD, TODAY } from './config.js'
import { generateDays } from './logic/schedule.js'
import {
  countStatuses,
  currentStats,
  projectedStats,
  semesterTotal,
  allowedBunks,
  periodKey,
  togglePeriod,
  toggleDay,
  applyPlan,
  isBelowThreshold,
} from './logic/attendance.js'
import SummaryCard from './components/SummaryCard.jsx'
import SubjectCard from './components/SubjectCard.jsx'
import DayList from './components/DayList.jsx'

// Every working day of the semester, generated from the timetable and academic calendar.
// Every lecture starts as present (green), so every subject starts at 100%.
// Worked out once when the app loads; it never changes after that.
const days = generateDays(timetable, calendar, calendar.semesterStart, calendar.semesterEnd)

// Work out the numbers for one course.
// "now" comes from the untouched days (all present = 100%);
// "projected" comes from the copy with your marked absences.
function subjectNumbers(course, plannedDays) {
  const baseCounts = countStatuses(days, course.code)
  const plannedCounts = countStatuses(plannedDays, course.code)
  return {
    code: course.code,
    name: course.name,
    type: course.type,
    now: currentStats(baseCounts),
    projected: projectedStats(plannedCounts),
    allowed: allowedBunks(semesterTotal(baseCounts), THRESHOLD),
  }
}

function App() {
  // State: values React remembers between renders. Changing them redraws the screen.
  const [isPlanning, setIsPlanning] = useState(false)
  const [plannedKeys, setPlannedKeys] = useState([])

  // Called when the Plan Leave switch is tapped.
  function handleTogglePlanning() {
    setIsPlanning(!isPlanning)
  }

  // Called when a lecture bubble is tapped: mark it absent (or undo).
  function handleTogglePeriod(date, periodNumber) {
    setPlannedKeys(togglePeriod(plannedKeys, periodKey(date, periodNumber)))
  }

  // Called when a date is tapped: mark the whole day absent (or undo).
  function handleToggleDay(day) {
    setPlannedKeys(toggleDay(plannedKeys, day))
  }

  // Called by the "Clear plan" button: un-mark every lecture.
  function handleClearPlan() {
    setPlannedKeys([])
  }

  // ---- Derived values: worked out again on every render, never stored in state ----

  // The sandbox copy: days with your marked lectures set to "planned" (absent).
  // The original `days` are never changed.
  const plannedDays = applyPlan(days, plannedKeys)

  // The day list shows the plan only while planning is switched on.
  const shownDays = isPlanning ? plannedDays : days

  const subjects = courses.map((course) => subjectNumbers(course, plannedDays))

  // Labs are counted separately, so show them in their own section.
  const theorySubjects = subjects.filter((s) => s.type === 'theory')
  const labSubjects = subjects.filter((s) => s.type === 'lab')

  // Overall numbers: count every period of every course.
  const overallNow = currentStats(countStatuses(days))
  const overallProjected = projectedStats(countStatuses(plannedDays))

  // Subjects below the threshold: projected while planning, current otherwise.
  const atRiskNames = subjects
    .filter((s) => isBelowThreshold(isPlanning ? s.projected.percent : s.now.percent, THRESHOLD))
    .map((s) => s.name)

  // Overall bunks allowed = sum of each subject's allowance (the threshold is per subject).
  let overallAllowed = 0
  for (const subject of subjects) {
    overallAllowed = overallAllowed + subject.allowed
  }

  return (
    <main className="app">
      <header className="app-header">
        <h1 className="app-name">Leave Planner</h1>
        <span className="app-header-divider"></span>
        <span className="app-section">ATTENDANCE</span>
      </header>

      <SummaryCard
        now={overallNow}
        projected={overallProjected}
        bunksAllowed={overallAllowed}
        threshold={THRESHOLD}
        atRiskNames={atRiskNames}
        isPlanning={isPlanning}
        onTogglePlanning={handleTogglePlanning}
        plannedCount={plannedKeys.length}
        onClearPlan={handleClearPlan}
      />

      <h2 className="section-heading">Theory</h2>
      {theorySubjects.map((subject) => (
        <SubjectCard
          key={subject.code}
          subject={subject}
          isPlanning={isPlanning}
          threshold={THRESHOLD}
        />
      ))}

      <h2 className="section-heading">Labs</h2>
      {labSubjects.map((subject) => (
        <SubjectCard
          key={subject.code}
          subject={subject}
          isPlanning={isPlanning}
          threshold={THRESHOLD}
        />
      ))}

      <DayList
        days={shownDays}
        today={TODAY}
        onTogglePeriod={isPlanning ? handleTogglePeriod : undefined}
        onToggleDay={isPlanning ? handleToggleDay : undefined}
      />
    </main>
  )
}

export default App
