import { useState } from 'react'
import { attendanceTone } from '../logic/attendance.js'

// Pick two saved plans and see them side by side, subject by subject.
function ScenarioCompare({ scenarios, threshold, safeLevel }) {
  // Which two plans are picked (by name). Start with the first two.
  const [nameA, setNameA] = useState(scenarios[0].name)
  const [nameB, setNameB] = useState(scenarios[1].name)

  // If a picked plan was deleted, fall back to the first / second one.
  const planA = scenarios.find((s) => s.name === nameA) || scenarios[0]
  const planB = scenarios.find((s) => s.name === nameB) || scenarios[1]

  // One table cell: % in its colour band, and absences out of the bunk limit.
  function cell(stats) {
    const tone = attendanceTone(stats.percent, threshold, safeLevel)
    return (
      <td>
        <span className={'compare-percent tone-' + tone}>{stats.percent.toFixed(2)}%</span>
        {stats.allowed !== undefined && (
          <span className={stats.absent > stats.allowed ? 'compare-bunks tone-danger' : 'compare-bunks'}>
            {stats.absent}/{stats.allowed}
          </span>
        )}
      </td>
    )
  }

  return (
    <div className="compare">
      <p className="scenario-title">Compare</p>

      <div className="compare-pickers">
        <select value={planA.name} onChange={(event) => setNameA(event.target.value)} aria-label="First plan">
          {scenarios.map((s) => (
            <option key={s.name} value={s.name}>
              {s.name}
            </option>
          ))}
        </select>
        <span className="compare-vs">vs</span>
        <select value={planB.name} onChange={(event) => setNameB(event.target.value)} aria-label="Second plan">
          {scenarios.map((s) => (
            <option key={s.name} value={s.name}>
              {s.name}
            </option>
          ))}
        </select>
      </div>

      <table className="compare-table">
        <thead>
          <tr>
            <th>Subject</th>
            <th>{planA.name}</th>
            <th>{planB.name}</th>
          </tr>
        </thead>
        <tbody>
          <tr className="compare-overall">
            <td>Overall</td>
            {cell(planA.result.overall)}
            {cell(planB.result.overall)}
          </tr>
          {planA.result.subjects.map((subjectA, index) => (
            <tr key={subjectA.code}>
              <td>
                <span className="compare-name">{subjectA.name}</span>
                <span className="compare-code">{subjectA.code}</span>
              </td>
              {cell(subjectA)}
              {cell(planB.result.subjects[index])}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default ScenarioCompare
