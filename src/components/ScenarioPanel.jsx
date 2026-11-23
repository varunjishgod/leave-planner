import { useState } from 'react'
import './ScenarioPanel.css'
import ScenarioCompare from './ScenarioCompare.jsx'
import ScenarioCombine from './ScenarioCombine.jsx'
import { attendanceTone } from '../logic/attendance.js'
import { hasScenario, sameKeys } from '../logic/scenarios.js'

// "Saved plans" card (only shown while Plan Leave is on).
// Every plan has three buttons:
//   Edit   – show this plan's lectures on screen so you can change them
//   Save   – store the changes on screen into this plan
//   Delete – remove the plan (asks first, inside the row)
// `activePlan` is the plan being edited. Nothing is saved until you tap Save.
function ScenarioPanel({
  scenarios,
  plannedKeys,
  activePlan,
  threshold,
  safeLevel,
  onCreate,
  onEdit,
  onSave,
  onDelete,
  summarize,
  combinePicks,
  onTogglePick,
  onClearPicks,
  onUseCombined,
}) {
  // Local state: what is typed in the box, and which plan is asking "Delete?".
  const [name, setName] = useState('')
  const [confirmingDelete, setConfirmingDelete] = useState(null)

  // The plan being edited, and whether the screen differs from what is saved in it.
  const editingPlan = scenarios.find((s) => s.name === activePlan)
  const hasUnsavedChanges = editingPlan !== undefined && !sameKeys(editingPlan.plannedKeys, plannedKeys)

  const trimmed = name.trim()
  const nameTaken = hasScenario(scenarios, trimmed)
  // While there are unsaved changes, save them first (so nothing is lost by accident).
  const canCreate = trimmed !== '' && !nameTaken && !hasUnsavedChanges

  function handleSubmit(event) {
    event.preventDefault() // stop the browser from reloading the page
    if (canCreate) {
      onCreate(trimmed)
      setName('')
    }
  }

  // We ask inside the row instead of window.confirm(): pop-ups can be blocked
  // (for example in embedded browsers), which would make delete silently do nothing.
  function handleConfirmDelete(scenarioName) {
    onDelete(scenarioName)
    setConfirmingDelete(null)
  }

  // One line saying what is happening right now.
  let status
  if (hasUnsavedChanges) {
    status = '“' + activePlan + '” has unsaved changes. Tap Save to keep them.'
  } else if (editingPlan !== undefined) {
    status = 'Editing “' + activePlan + '”. Mark or unmark lectures, then tap Save.'
  } else if (plannedKeys.length > 0) {
    status = 'Your ' + plannedKeys.length + ' marked lectures are not in a plan. Name them to save as a plan.'
  } else {
    status = 'Name a new plan, then mark the lectures you would skip.'
  }

  return (
    <section className="card scenario-card">
      <p className="scenario-title">Saved plans</p>
      <p className={hasUnsavedChanges ? 'scenario-status scenario-status-unsaved' : 'scenario-status'}>
        {status}
      </p>

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
            const isEditing = scenario.name === activePlan
            const isDirty = isEditing && hasUnsavedChanges

            // This row is asking "Delete this plan?"
            if (confirmingDelete === scenario.name) {
              return (
                <li key={scenario.name} className="scenario-item scenario-item-confirm">
                  <p className="scenario-confirm-text">
                    Delete <strong>{scenario.name}</strong>?
                  </p>
                  <button
                    type="button"
                    className="scenario-button scenario-delete-yes"
                    onClick={() => handleConfirmDelete(scenario.name)}
                  >
                    Delete
                  </button>
                  <button
                    type="button"
                    className="scenario-button"
                    onClick={() => setConfirmingDelete(null)}
                  >
                    Cancel
                  </button>
                </li>
              )
            }

            // What the row shows: the saved plan, or (while editing) what is on screen now.
            const count = isEditing ? plannedKeys.length : scenario.plannedKeys.length
            const percent = scenario.result.overall.percent
            const tone = attendanceTone(percent, threshold, safeLevel)

            return (
              <li key={scenario.name} className={isEditing ? 'scenario-item scenario-item-open' : 'scenario-item'}>
                <div className="scenario-info">
                  <p className="scenario-name">
                    <span className="scenario-name-text">{scenario.name}</span>
                    {isEditing && <span className="scenario-loaded">EDITING</span>}
                  </p>
                  <p className="scenario-meta">
                    {isDirty ? (
                      <span className="scenario-unsaved">
                        {count} {count === 1 ? 'lecture' : 'lectures'} · not saved
                      </span>
                    ) : (
                      <>
                        {count} {count === 1 ? 'lecture' : 'lectures'} ·{' '}
                        <span className={'scenario-percent tone-' + tone}>{percent.toFixed(2)}%</span>
                      </>
                    )}
                  </p>
                </div>

                <div className="scenario-actions">
                  <button
                    type="button"
                    className="scenario-button"
                    onClick={() => onEdit(scenario)}
                    disabled={isEditing || hasUnsavedChanges}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className="scenario-button scenario-save-button"
                    onClick={() => onSave(scenario.name)}
                    disabled={!isDirty}
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    className="scenario-button scenario-delete"
                    onClick={() => setConfirmingDelete(scenario.name)}
                  >
                    Delete
                  </button>
                </div>
              </li>
            )
          })}
        </ul>
      )}

      {scenarios.length >= 2 && (
        <ScenarioCompare scenarios={scenarios} threshold={threshold} safeLevel={safeLevel} />
      )}

      {scenarios.length >= 2 && (
        <ScenarioCombine
          scenarios={scenarios}
          threshold={threshold}
          safeLevel={safeLevel}
          summarize={summarize}
          picked={combinePicks}
          onTogglePick={onTogglePick}
          onClearPicks={onClearPicks}
          canUseCombined={!hasUnsavedChanges}
          onUseCombined={onUseCombined}
        />
      )}
    </section>
  )
}

export default ScenarioPanel
