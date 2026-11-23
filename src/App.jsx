import './App.css'
import courses from './data/courses.json'
import days from './data/days.json'
import { THRESHOLD, TODAY } from './config.js'

// Temporary check for milestone 2: count what we loaded.
// (Real attendance maths will live in src/logic/attendance.js from milestone 3.)
let periodCount = 0
for (const day of days) {
  periodCount = periodCount + day.periods.length
}

function App() {
  return (
    <main className="app">
      <header className="app-header">
        <h1 className="app-name">Leave Planner</h1>
        <span className="app-header-divider"></span>
        <span className="app-section">ATTENDANCE</span>
      </header>

      {/* Sample card: will become the summary card in milestone 4 */}
      <section className="card">
        <p className="card-label">Data loaded</p>
        <p className="card-text">Courses: {courses.length}</p>
        <p className="card-text">Days: {days.length}</p>
        <p className="card-text">Periods: {periodCount}</p>
        <p className="card-text">First day: {days[0].date}</p>
        <p className="card-text">Last day: {days[days.length - 1].date}</p>
        <p className="card-text">Today: {TODAY}</p>
        <p className="card-text">Threshold: {THRESHOLD}%</p>
      </section>
    </main>
  )
}

export default App
