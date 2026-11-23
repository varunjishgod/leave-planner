import { useState } from 'react'
import './ScenarioPanel.css'
import ScenarioCompare from './ScenarioCompare.jsx'
import { attendanceTone } from '../logic/attendance.js'
import { hasScenario } from '../logic/scenarios.js'

// Same lectures marked, in any order?
function sameKeys(a, b) {
  return a.length === b.length && a.every((key) => b.includes(key))
}

// "Saved plans" card (only shown while Plan Leave is on).
// `scenarios` = saved plans, each with its worked-out `result` (from summarizePlan).
// Saving, loading and deleting are done by App through the on... functions.
function ScenarioPanel({ scenarios, plannedKeys, threshold, safeLevel, onSave, onLoad, onDelete }) {
  // Local state: only this card needs to know what is typed in the box.
  const [name, setName] = useState('')

  const trimmed = name.trim()
  const canSave = trimmed !== '' && plannedKeys.length > 0
  const isUpdate = hasScenario(scenarios, trimmed)

  function handleSubmit(event) {
    event.preventDefault() // stop the browser from reloading the page
    if (canSave) {
      onSave(trimmed)
    }
  }

  function handleDelete(scenarioName) {
    if (window.confirm('Delete the saved plan "' + scenarioName + '"?')) {
      onDelete(scenarioName)
    }
  }

  return (
    <section className="card scenario-card">
      <p className="scenario-title">Saved plans</p>

      <form className="scenario-form" onSubmit={handleSubmit}>
        <input
          className="scenario-input"
          type="text"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Name this plan, e.g. Diwali trip"
          maxLength={40}
          aria-label="Plan name"
        />
        <button type="submit" className="scenario-save" disabled={!canSave}>
          {isUpdate ? 'Update' : 'Save'}
        </button>
      </form>

      {plannedKeys.length === 0 && (
        <p className="scenario-note">Mark some lectures absent first, then save them as a plan.</p>
      )}

      {scenarios.length === 0 ? (
        <p className="scenario-note">No saved plans yet.</p>
      ) : (
        <ul className="scenario-list">
          {scenarios.map((scenario) => {
            const percent = scenario.result.overall.percent
            const tone = attendanceTone(percent, threshold, safeLevel)
            const isLoaded = sameKeys(scenario.plannedKeys, plannedKeys)
            const count = scenario.plannedKeys.length

            return (
              <li key={scenario.name} className="scenario-item">
                <div className="scenario-info">
                  <p className="scenario-name">
                    <span className="scenario-name-text">{scenario.name}</span>
                    {isLoaded && <span className="scenario-loaded">ON SCREEN</span>}
                  </p>
                  <p className="scenario-meta">
                    {count} {count === 1 ? 'lecture' : 'lectures'} ·{' '}
                    <span className={'scenario-percent tone-' + tone}>{percent.toFixed(2)}%</span>
                  </p>
                </div>
                <button
                  type="button"
                  className="scenario-button"
                  onClick={() => {
                    onLoad(scenario)
                    setName(scenario.name)
                  }}
                  disabled={isLoaded}
                >
                  Load
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
