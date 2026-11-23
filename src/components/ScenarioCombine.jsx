import { attendanceTone } from '../logic/attendance.js'
import { combineScenarios } from '../logic/scenarios.js'

// "Combine plans": pick several saved plans and see the total effect of taking
// ALL of those leaves, including which subjects would have an attendance shortage.
// `summarize(keys)` comes from App and works out the result for a list of lectures.
// The picked plan names live in App (`picked`), because the day list and the cards
// also show the combined lectures while 2 or more plans are picked.
function ScenarioCombine({
  scenarios,
  threshold,
  safeLevel,
  summarize,
  picked,
  onTogglePick,
  onClearPicks,
  canUseCombined,
  onUseCombined,
}) {
  // Ignore names of plans that were deleted in the meantime.
  const pickedPlans = scenarios.filter((s) => picked.includes(s.name))

  const combined = combineScenarios(pickedPlans)
  const result = summarize(combined.keys)
  const overallTone = attendanceTone(result.overall.percent, threshold, safeLevel)

  // Subjects that would end below the threshold = attendance shortage.
  const shortages = result.subjects.filter((s) => s.percent < threshold)

  return (
    <div className="combine">
      <p className="scenario-title">Combine plans</p>
      <p className="scenario-note">
        Pick two or more plans to see what happens if you take all of them. Their lectures show red
        in the day list.
      </p>

      <div className="combine-picks">
        {scenarios.map((s) => (
          <button
            key={s.name}
            type="button"
            className={picked.includes(s.name) ? 'combine-chip combine-chip-on' : 'combine-chip'}
            aria-pressed={picked.includes(s.name)}
            onClick={() => onTogglePick(s.name)}
          >
            {s.name} · {s.plannedKeys.length}
          </button>
        ))}
      </div>

      {pickedPlans.length >= 2 && (
        <>
          <p className="combine-total">
            {combined.keys.length} lectures missed
            {combined.overlap > 0 && <span className="combine-overlap"> ({combined.overlap} counted once, in more than one plan)</span>}
            {' · '}
            <span className={'scenario-percent tone-' + overallTone}>{result.overall.percent.toFixed(2)}%</span>
          </p>

          {shortages.length > 0 ? (
            <div className="combine-box combine-box-short">
              <p className="combine-box-title">Attendance shortage in {shortages.length} {shortages.length === 1 ? 'subject' : 'subjects'}</p>
              {shortages.map((s) => (
                <p key={s.code} className="combine-box-line">
                  {s.name}: {s.percent.toFixed(2)}% · {s.absent - s.allowed} over the {s.allowed}-bunk limit
                </p>
              ))}
            </div>
          ) : (
            <div className="combine-box combine-box-ok">
              <p className="combine-box-title">No shortage</p>
              <p className="combine-box-line">Every subject stays at {threshold}% or above.</p>
            </div>
          )}

          <table className="compare-table">
            <thead>
              <tr>
                <th>Subject</th>
                <th>Combined</th>
              </tr>
            </thead>
            <tbody>
              {result.subjects.map((s) => (
                <tr key={s.code}>
                  <td>
                    <span className="compare-name">{s.name}</span>
                    <span className="compare-code">{s.code}</span>
                  </td>
                  <td>
                    <span className={'compare-percent tone-' + attendanceTone(s.percent, threshold, safeLevel)}>
                      {s.percent.toFixed(2)}%
                    </span>
                    <span className={s.absent > s.allowed ? 'compare-bunks tone-danger' : 'compare-bunks'}>
                      {s.absent}/{s.allowed}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="combine-actions">
            <button type="button" className="scenario-button" onClick={onClearPicks}>
              Clear selection
            </button>
            <button
              type="button"
              className="scenario-button"
              onClick={() => onUseCombined(combined.keys)}
              disabled={!canUseCombined}
            >
              Edit these lectures
            </button>
          </div>
          {!canUseCombined && (
            <p className="scenario-note">Save your changes first to edit the combined lectures.</p>
          )}
        </>
      )}
    </div>
  )
}

export default ScenarioCombine
