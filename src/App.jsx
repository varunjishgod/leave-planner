import { useState, useEffect } from 'react'
import './App.css'
import headerLogo from './assets/sastranet-header.png'
import courses from './data/courses.json'
import timetable from './data/timetable.json'
import calendar from './data/calendar.json'
import { THRESHOLD, SAFE_LEVEL, TODAY } from './config.js'
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
  withoutAttendance,
  emptyStats,
  summarizePlan,
} from './logic/attendance.js'
import {
  readSavedScenarios,
  writeSavedScenarios,
  saveScenario,
  deleteScenario,
} from './logic/scenarios.js'
import SummaryCard from './components/SummaryCard.jsx'
import SubjectCard from './components/SubjectCard.jsx'
import DayList from './components/DayList.jsx'
import ViewTabs from './components/ViewTabs.jsx'
import ScenarioPanel from './components/ScenarioPanel.jsx'

// Every working day of the semester, generated from the timetable and academic calendar.
// Every lecture starts as present (green), so every subject starts at 100%.
// Worked out once when the app loads; it never changes after that.
const days = generateDays(timetable, calendar, calendar.semesterStart, calendar.semesterEnd)

// What the day list shows while Plan Leave is off: every lecture grey (nothing recorded).
const unmarkedDays = withoutAttendance(days)

// Work out the numbers for one course.
// Plan Leave off: "now" is all zeros (0%), nothing is recorded.
// Plan Leave on:  "now" is the untouched days (all present = 100%) and
//                 "projected" is the copy with your marked absences.
function subjectNumbers(course, plannedDays, isPlanning) {
  const baseCounts = countStatuses(days, course.code)
  const plannedCounts = countStatuses(plannedDays, course.code)
  return {
    code: course.code,
    name: course.name,
    type: course.type,
    now: isPlanning ? currentStats(baseCounts) : emptyStats(),
    projected: projectedStats(plannedCounts),
    allowed: allowedBunks(semesterTotal(baseCounts), THRESHOLD),
  }
}

// The hint under the tabs: what can you do right now?
// Plan Leave off = view only. On = Day wise is where you edit, Coursewise shows the result.
function viewHint(isPlanning, view) {
  if (!isPlanning) {
    return 'View only. Turn on Plan Leave to mark lectures absent.'
  }
  if (view === 'day') {
    return 'Tap a lecture (or a date for the whole day) to mark it absent. Tap again to undo.'
  }
  return 'Your % per subject after marking. Switch to Day wise to mark lectures.'
}

function App() {
  // State: values React remembers between renders. Changing them redraws the screen.
  const [isPlanning, setIsPlanning] = useState(false)
  const [plannedKeys, setPlannedKeys] = useState([])
  const [view, setView] = useState('day') // "day" (Day wise) or "course" (Coursewise)

  // Saved plans. The function form of useState runs only once, on the first render,
  // so we read localStorage once instead of on every render.
  const [scenarios, setScenarios] = useState(() => readSavedScenarios())

  // Side effect: whenever the saved list changes, write it to localStorage
  // so it is still there after a refresh. [scenarios] = "run when scenarios changes".
  useEffect(() => {
    writeSavedScenarios(scenarios)
  }, [scenarios])

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

  // Saved plans: save the current marks under a name, load one back, or delete one.
  function handleSaveScenario(name) {
    setScenarios(saveScenario(scenarios, name, plannedKeys))
  }

  function handleLoadScenario(scenario) {
    setPlannedKeys(scenario.plannedKeys)
  }

  function handleDeleteScenario(name) {
    setScenarios(deleteScenario(scenarios, name))
  }

  // Called by the "Clear plan" button: un-mark every lecture.
  function handleClearPlan() {
    setPlannedKeys([])
  }

  // ---- Derived values: worked out again on every render, never stored in state ----

  // The sandbox copy: days with your marked lectures set to "planned" (absent).
  // The original `days` are never changed.
  const plannedDays = applyPlan(days, plannedKeys)

  // Plan Leave on: green lectures with your marks. Off: every lecture grey.
  const shownDays = isPlanning ? plannedDays : unmarkedDays

  const subjects = courses.map((course) => subjectNumbers(course, plannedDays, isPlanning))

  // Labs are counted separately, so show them in their own section.
  const theorySubjects = subjects.filter((s) => s.type === 'theory')
  const labSubjects = subjects.filter((s) => s.type === 'lab')

  // Overall numbers: count every period of every course.
  const overallNow = isPlanning ? currentStats(countStatuses(days)) : emptyStats()
  const overallProjected = projectedStats(countStatuses(plannedDays))

  // Subjects that would end below the threshold. Only while planning:
  // with Plan Leave off nothing is recorded, so there is nothing to warn about.
  const atRiskNames = isPlanning
    ? subjects.filter((s) => isBelowThreshold(s.projected.percent, THRESHOLD)).map((s) => s.name)
    : []

  // Each saved plan with its end result, for the list and the compare table.
  const scenarioResults = scenarios.map((scenario) => ({
    ...scenario,
    result: summarizePlan(days, courses, scenario.plannedKeys, THRESHOLD),
  }))

  // Overall bunks allowed = sum of each subject's allowance (the threshold is per subject).
  let overallAllowed = 0
  for (const subject of subjects) {
    overallAllowed = overallAllowed + subject.allowed
  }

  return (
    <main className="app">
      <header className="app-header">
        <h1 className="app-title">
          <img className="app-logo" src={headerLogo} alt="sastranet | ATTENDANCE" />
        </h1>
      </header>

      <SummaryCard
        now={overallNow}
        projected={overallProjected}
        bunksAllowed={overallAllowed}
        threshold={THRESHOLD}
        safeLevel={SAFE_LEVEL}
        atRiskNames={atRiskNames}
        isPlanning={isPlanning}
        onTogglePlanning={handleTogglePlanning}
        plannedCount={plannedKeys.length}
        onClearPlan={handleClearPlan}
      />

      {/* Saved plans only make sense while planning (editable mode) */}
      {isPlanning && (
        <ScenarioPanel
          scenarios={scenarioResults}
          plannedKeys={plannedKeys}
          threshold={THRESHOLD}
          safeLevel={SAFE_LEVEL}
          onSave={handleSaveScenario}
          onLoad={handleLoadScenario}
          onDelete={handleDeleteScenario}
        />
      )}

      <ViewTabs view={view} onChangeView={setView} />

      {/* One line telling you what you can do in this view */}
      <p className="view-hint">{viewHint(isPlanning, view)}</p>

      {view === 'course' && (
        <>
          <h2 className="section-heading">Theory</h2>
          {theorySubjects.map((subject) => (
            <SubjectCard
              key={subject.code}
              subject={subject}
              isPlanning={isPlanning}
              threshold={THRESHOLD}
              safeLevel={SAFE_LEVEL}
            />
          ))}

          <h2 className="section-heading">Labs</h2>
          {labSubjects.map((subject) => (
            <SubjectCard
              key={subject.code}
              subject={subject}
              isPlanning={isPlanning}
              threshold={THRESHOLD}
              safeLevel={SAFE_LEVEL}
            />
          ))}
        </>
      )}

      {view === 'day' && (
        <DayList
          days={shownDays}
          today={TODAY}
          onTogglePeriod={isPlanning ? handleTogglePeriod : undefined}
          onToggleDay={isPlanning ? handleToggleDay : undefined}
        />
      )}
    </main>
  )
}

export default App
