import './PeriodBubble.css'

// One numbered circle for one period.
// The CSS class comes from the status: present (green), absent (maroon),
// upcoming (outline) or planned (dashed maroon).
// If `onTap` is given, the bubble is a button you can tap; otherwise it is plain text.
function PeriodBubble({ period, onTap }) {
  const className = 'bubble bubble-' + period.status

  if (onTap) {
    return (
      <button
        type="button"
        className={className + ' bubble-tappable'}
        title={period.courseCode}
        aria-pressed={period.status === 'planned'}
        onClick={onTap}
      >
        {period.number}
      </button>
    )
  }

  return (
    <span className={className} title={period.courseCode}>
      {period.number}
    </span>
  )
}

export default PeriodBubble
