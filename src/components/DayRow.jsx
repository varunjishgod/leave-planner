import './DayRow.css'
import PeriodBubble from './PeriodBubble.jsx'
import { dayOfMonth, weekdayName } from '../logic/dates.js'

// A class that has not happened yet: it can be planned (or un-planned).
function isFuture(period) {
  return period.status === 'upcoming' || period.status === 'planned'
}

// One row: date number on the left, a bubble per period, weekday on the right.
// While planning (the handlers are given), you can tap a future bubble to plan one
// period, or tap the date to plan every future period of that day.
function DayRow({ day, isToday, onTogglePeriod, onToggleDay }) {
  const isPlanning = onTogglePeriod !== undefined
  const hasFuturePeriods = day.periods.some(isFuture)
  const isWholeDayPlanned = hasFuturePeriods && day.periods.filter(isFuture).every((p) => p.status === 'planned')

  const dateText = dayOfMonth(day.date)

  return (
    <div className="day-row">
      {isPlanning && hasFuturePeriods ? (
        <button
          type="button"
          className={isWholeDayPlanned ? 'day-number day-number-button day-planned' : 'day-number day-number-button'}
          aria-pressed={isWholeDayPlanned}
          aria-label={'Plan leave for the whole day ' + day.date}
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
            onTap={isPlanning && isFuture(period) ? () => onTogglePeriod(day.date, period.number) : undefined}
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
