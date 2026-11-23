import './ProgressBar.css'

// A yellow bar filled to `percent` (0–100). If `warn` is true the fill is red.
function ProgressBar({ percent, warn }) {
  // Keep the width between 0% and 100% so the bar never overflows.
  const width = Math.min(Math.max(percent, 0), 100)

  return (
    <div className="progress-track">
      <div
        className={warn ? 'progress-fill progress-fill-warn' : 'progress-fill'}
        style={{ width: width + '%' }}
      ></div>
    </div>
  )
}

export default ProgressBar
