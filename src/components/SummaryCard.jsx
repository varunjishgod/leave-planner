import './SummaryCard.css'
import ProgressBar from './ProgressBar.jsx'
import StatChip from './StatChip.jsx'
import Projected from './Projected.jsx'
import { attendanceTone } from '../logic/attendance.js'

// The top card: big attendance %, Plan Leave switch, progress bar and four stat chips.
// It only displays numbers; App works them out and passes them in as props.
// `now` and `projected` are { present, absent, total, percent } objects.
// While planning, every value is shown as "current → projected".
// The buttons do not change anything themselves: they call the functions App gave us.
// atRiskNames lists subjects below the threshold (projected while planning, current otherwise).
// The big % and bar use the same green / yellow / red bands as the subject cards.
function SummaryCard({
  now,
  projected,
  bunksAllowed,
  threshold,
  safeLevel,
  atRiskNames,
  isPlanning,
  onTogglePlanning,
  plannedCount,
  onClearPlan,
}) {
  const nowTone = attendanceTone(now.percent, threshold, safeLevel)
  const projectedTone = attendanceTone(projected.percent, threshold, safeLevel)

  return (
    <section className="card summary-card">
      <div className="summary-top">
        <p className="summary-percent">
          <Projected
            current={now.percent.toFixed(2) + '%'}
            projected={projected.percent.toFixed(2) + '% after marking'}
            showProjected={isPlanning}
            currentTone={nowTone}
            projectedTone={projectedTone}
          />
        </p>

        <button
          type="button"
          className="plan-toggle"
          role="switch"
          aria-checked={isPlanning}
          onClick={onTogglePlanning}
        >
          <span className="plan-toggle-label">Plan Leave</span>
          <span className={isPlanning ? 'switch switch-on' : 'switch'}>
            <span className="switch-knob"></span>
          </span>
        </button>
      </div>

      <ProgressBar
        percent={isPlanning ? projected.percent : now.percent}
        tone={isPlanning ? projectedTone : nowTone}
      />

      <div className="summary-chips">
        <StatChip
          value={<Projected current={now.present} projected={projected.present} showProjected={isPlanning} />}
          label="PRESENT"
          variant="present"
        />
        <StatChip
          value={<Projected current={now.absent} projected={projected.absent} showProjected={isPlanning} />}
          label="ABSENT"
          variant="absent"
        />
        <StatChip
          value={<Projected current={now.total} projected={projected.total} showProjected={isPlanning} />}
          label="TOTAL"
          variant="neutral"
        />
        <StatChip
          value={
            <Projected
              current={now.absent + '/' + bunksAllowed}
              projected={projected.absent + '/' + bunksAllowed}
              showProjected={isPlanning}
            />
          }
          label="BUNKS"
          variant="neutral"
        />
      </div>

      {atRiskNames.length > 0 && (
        <p className="summary-warning">
          {isPlanning ? 'With this plan, below ' : 'Below '}
          {threshold}%{isPlanning ? '' : ' right now'}: {atRiskNames.join(', ')}
        </p>
      )}

      {isPlanning && (
        <p className="summary-hint">
          Tap any lecture (or a date for the whole day) to mark it absent. Tap again to undo.
        </p>
      )}

      {isPlanning && plannedCount > 0 && (
        <button type="button" className="clear-plan" onClick={onClearPlan}>
          Clear all ({plannedCount} {plannedCount === 1 ? 'lecture' : 'lectures'} marked)
        </button>
      )}
    </section>
  )
}

export default SummaryCard
