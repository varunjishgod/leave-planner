import './StatChip.css'

// A small box with a big value and a label under it, e.g. "108 / PRESENT".
// `variant` picks the background tint: "present", "absent" or "neutral".
function StatChip({ value, label, variant }) {
  return (
    <div className={'stat-chip stat-chip-' + variant}>
      <span className="stat-chip-value">{value}</span>
      <span className="stat-chip-label">{label}</span>
    </div>
  )
}

export default StatChip
