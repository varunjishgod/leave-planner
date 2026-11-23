import { useState } from 'react'
import './ScenarioPanel.css'
import ScenarioCompare from './ScenarioCompare.jsx'
import { attendanceTone } from '../logic/attendance.js'
import { hasScenario } from '../logic/scenarios.js'

// "Saved plans" card (only shown while Plan Leave is on).
// Each plan has its own marked lectures. The open plan (`activePlan`) is saved
// automatically every time you mark or unmark a lecture.
// `scenarios` = saved plans, each with its worked-out `result` (from summarizePlan).
// Creating, opening and deleting are done by App through the on... functions.
function ScenarioPanel({
  scenarios,
  plannedKeys,
  activePlan,
  threshold,
  safeLevel,
  onCreate,
  onOpen,
  onDelete,
}) {
  // Local state: only this card needs to know what is typed in the box.
  const [name, setName] = useState('')

  const trimmed = name.trim()
  const nameTaken = hasScenario(scenarios, trimmed)
  const canCreate = trimmed !== '' && !nameTaken

  function handleSubmit(event) {
    event.preventDefault() // stop the browser from reloading the page
    if (canCreate) {
      onCreate(trimmed)
      setName('')
    }
  }

  function handleDelete(scenarioName) {
    if (window.confirm('Delete the saved plan "' + scenarioName + '"?')) {
      onDelete(scenarioName)
    }
  }

  // One line saying what is happening right now.
  let status
  if (activePlan !== null) {
    status = 'Editing “' + activePlan + '”. Every lecture you mark is saved into it.'
  } else if (plannedKeys.length > 0) {
    status = 'Your ' + plannedKeys.length + ' marked lectures are not saved. Name them to save as a plan.'
  } else {
    status = 'Name a new plan, then mark the lectures you would skip.'
  }

  return (
    <section className="card scenario-card">
      <p className="scenario-title">Saved plans</p>
      <p className="scenario-status">{status}</p>

      <form className="scenario-form" onSubmit={handleSubmit}>
        <input
          className="scenario-input"
          type="text"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="New plan name, e.g. Diwali trip"
          maxLength={40}
          aria-label="New plan name"
        />
        <button type="submit" className="scenario-save" disabled={!canCreate}>
          New plan
        </button>
      </form>

      {nameTaken && <p className="scenario-note">A plan with this name already exists.</p>}

      {scenarios.length === 0 ? (
        <p className="scenario-note">No saved plans yet.</p>
      ) : (
        <ul className="scenario-list">
          {scenarios.map((scenario) => {
            const percent = scenario.result.overall.percent
            const tone = attendanceTone(percent, threshold, safeLevel)
            const isOpen = scenario.name === activePlan
            const count = scenario.plannedKeys.length

            return (
              <li key={scenario.name} className={isOpen ? 'scenario-item scenario-item-open' : 'scenario-item'}>
                <div className="scenario-info">
                  <p className="scenario-name">
                    <span className="scenario-name-text">{scenario.name}</span>
                    {isOpen && <span className="scenario-loaded">EDITING</span>}
                  </p>
                  <p className="scenario-meta">
                    {count} {count === 1 ? 'lecture' : 'lectures'} ·{' '}
                    <span className={'scenario-percent tone-' + tone}>{percent.toFixed(2)}%</span>
                  </p>
                </div>
                <button
                  type="button"
                  className="scenario-button"
                  onClick={() => onOpen(scenario)}
                  disabled={isOpen}
                >
                  Open
                </button>
                <button
                  type="button"
                  className="scenario-button scenario-delete"
                  onClick={() => handleDelete(scenario.name)}
                  aria-label={'Delete ' + scenario.name}
                >
                  ✕
                </button>
              </li>
            )
          })}
        </ul>
      )}

      {scenarios.length >= 2 && (
        <ScenarioCompare scenarios={scenarios} threshold={threshold} safeLevel={safeLevel} />
      )}
    </section>
  )
}

export default ScenarioPanel
