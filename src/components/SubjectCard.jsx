import './SubjectCard.css'
import ProgressBar from './ProgressBar.jsx'
import Projected from './Projected.jsx'
import { isBelowThreshold, attendanceTone } from '../logic/attendance.js'

// One card per course: name, %, progress bar, classes attended and bunks.
// `subject` is one object made by subjectNumbers() in App.jsx:
// { code, name, type, now, projected, allowed }.
// While planning, % and bunks are shown as "current → projected".
// The % and bar are green (at or above safeLevel), yellow (between threshold
// and safeLevel) or red (below threshold). Bunks over the limit are red.
function SubjectCard({ subject, isPlanning, threshold, safeLevel }) {
  const { now, projected } = subject

  const nowTone = attendanceTone(now.percent, threshold, safeLevel)
  const projectedTone = attendanceTone(projected.percent, threshold, safeLevel)

  const shownPercent = isPlanning ? projected.percent : now.percent
  const shownTone = isPlanning ? projectedTone : nowTone
  const shownLow = isBelowThreshold(shownPercent, threshold)

  return (
    <article className="subject-card">
      <div className="subject-top">
        <div>
          <p className="subject-name">{subject.name}</p>
          <p className="subject-code">
            {subject.code} · {subject.type === 'lab' ? 'LAB' : 'THEORY'}
          </p>
        </div>
        <p className="subject-percent">
          <Projected
            current={now.percent.toFixed(2) + '%'}
            projected={projected.percent.toFixed(2) + '%'}
            showProjected={isPlanning}
            currentTone={nowTone}
            projectedTone={projectedTone}
          />
        </p>
      </div>

      <ProgressBar percent={shownPercent} tone={shownTone} />

      <div className="subject-bottom">
        <p className="subject-attended">
          {now.present}/{now.total} attended
        </p>
        <p className="subject-bunks">
          BUNKS{' '}
          <Projected
            current={now.absent + '/' + subject.allowed}
            projected={projected.absent + '/' + subject.allowed}
            showProjected={isPlanning}
            currentTone={now.absent > subject.allowed ? 'danger' : undefined}
            projectedTone={projected.absent > subject.allowed ? 'danger' : undefined}
          />
        </p>
      </div>

      {shownLow && (
        <p className="subject-warning">
          {isPlanning
            ? 'Ends below ' + threshold + '% with this plan'
            : 'Below ' + threshold + '% right now'}
        </p>
      )}
    </article>
  )
}

export default SubjectCard
