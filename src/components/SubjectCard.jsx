import './SubjectCard.css'
import ProgressBar from './ProgressBar.jsx'
import Projected from './Projected.jsx'
import { isBelowThreshold } from '../logic/attendance.js'

// One card per course: name, %, progress bar, classes attended and bunks.
// `subject` is one object made by subjectNumbers() in App.jsx:
// { code, name, type, now, projected, allowed }.
// While planning, % and bunks are shown as "current → projected".
// Anything below the threshold (or over the bunk limit) is shown in red.
function SubjectCard({ subject, isPlanning, threshold }) {
  const { now, projected } = subject

  const nowLow = isBelowThreshold(now.percent, threshold)
  const projectedLow = isBelowThreshold(projected.percent, threshold)
  const shownLow = isPlanning ? projectedLow : nowLow

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
            currentWarn={nowLow}
            projectedWarn={projectedLow}
          />
        </p>
      </div>

      <ProgressBar percent={isPlanning ? projected.percent : now.percent} warn={shownLow} />

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
            currentWarn={now.absent > subject.allowed}
            projectedWarn={projected.absent > subject.allowed}
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
