import './Projected.css'

// Shows "current → projected" while planning, or just "current" otherwise.
// `current` and `projected` are already-formatted text, e.g. "81.20%".
// currentWarn / projectedWarn turn that part red (below the threshold).
// The parent's CSS decides whether "→ projected" sits on the same line or below.
function Projected({ current, projected, showProjected, currentWarn, projectedWarn }) {
  return (
    <span className="projected">
      <span className={currentWarn ? 'projected-current is-warn' : 'projected-current'}>
        {current}
      </span>
      {showProjected && (
        <span className={projectedWarn ? 'projected-next is-warn' : 'projected-next'}>
          → {projected}
        </span>
      )}
    </span>
  )
}

export default Projected
