import './DayRow.css'
import PeriodBubble from './PeriodBubble.jsx'
import { dayOfMonth, weekdayName } from '../logic/dates.js'
import { canMark } from '../logic/attendance.js'

// One row: date number on the left, a bubble per period, weekday on the right.
// While planning (the handlers are given), tap a lecture to mark it absent,
// or tap the date to mark the whole day absent. Tap again to undo.
function DayRow({ day, isToday, onTogglePeriod, onToggleDay }) {
  const isPlanning = onTogglePeriod !== undefined
  const hasMarkable = day.periods.some(canMark)
  const isWholeDayPlanned = hasMarkable && day.periods.filter(canMark).every((p) => p.status === 'planned')

  const dateText = dayOfMonth(day.date)

  return (
    <div className="day-row">
      {isPlanning && hasMarkable ? (
        <button
          type="button"
          className={isWholeDayPlanned ? 'day-number day-number-button day-planned' : 'day-number day-number-button'}
          aria-pressed={isWholeDayPlanned}
          aria-label={'Mark the whole day absent ' + day.date}
          onClick={() => onToggleDay(day)}
        >
          {dateText}
        </button>
      ) : (
        <span className="day-number">{dateText}</span>
      )}

      <span className="day-divider"></span>

      <div className="day-bubbles">
        {/* CIA days are working days with exams only: no periods, just a label */}
        {day.exam && <span className="day-exam">{day.exam} · exams only</span>}

        {day.periods.map((period) => (
          <PeriodBubble
            key={period.number}
            period={period}
            onTap={isPlanning && canMark(period) ? () => onTogglePeriod(day.date, period.number) : undefined}
          />
        ))}
      </div>

      <span className={isToday ? 'day-weekday day-today' : 'day-weekday'}>
        {isToday ? 'TODAY' : weekdayName(day.date)}
        {/* Working Saturday: show which weekday's timetable it follows */}
        {day.follows && <span className="day-follows">{day.follows} TT</span>}
      </span>
    </div>
  )
}

export default DayRow
