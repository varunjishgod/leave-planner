import './ProgressBar.css'

// A bar filled to `percent` (0–100).
// `tone` picks the fill colour: "good" (green), "warning" (yellow) or "danger" (red).
// Without a tone the bar is yellow.
function ProgressBar({ percent, tone }) {
  // Keep the width between 0% and 100% so the bar never overflows.
  const width = Math.min(Math.max(percent, 0), 100)

  return (
    <div className="progress-track">
      <div
        className={tone ? 'progress-fill progress-fill-' + tone : 'progress-fill'}
        style={{ width: width + '%' }}
      ></div>
    </div>
  )
}

export default ProgressBar
