import './Projected.css'

// Shows "current → projected" while planning, or just "current" otherwise.
// `current` and `projected` are already-formatted text, e.g. "81.20%".
// currentTone / projectedTone colour each part: "good" (green), "warning" (yellow)
// or "danger" (red). Leave a tone out to keep the parent's normal colour.
// The parent's CSS decides whether "→ projected" sits on the same line or below.
function Projected({ current, projected, showProjected, currentTone, projectedTone }) {
  return (
    <span className="projected">
      <span className={currentTone ? 'projected-current tone-' + currentTone : 'projected-current'}>
        {current}
      </span>
      {showProjected && (
        <span className={projectedTone ? 'projected-next tone-' + projectedTone : 'projected-next'}>
          → {projected}
        </span>
      )}
    </span>
  )
}

export default Projected
