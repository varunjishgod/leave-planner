import './DayList.css'
import DayRow from './DayRow.jsx'
import { groupByMonthNewestFirst } from '../logic/dates.js'

// The day-wise list: a heading per month, then one DayRow per day (newest first).
// The two handlers are only given while planning; DayList just passes them down to each row.
function DayList({ days, today, onTogglePeriod, onToggleDay }) {
  const monthGroups = groupByMonthNewestFirst(days)

  return (
    <div className="day-list">
      {monthGroups.map((group) => (
        <section key={group.label} className="day-month">
          <h2 className="section-heading">{group.label}</h2>
          {group.days.map((day) => (
            <DayRow
              key={day.date}
              day={day}
              isToday={day.date === today}
              onTogglePeriod={onTogglePeriod}
              onToggleDay={onToggleDay}
            />
          ))}
        </section>
      ))}
    </div>
  )
}

export default DayList
