import './ViewTabs.css'

// The "Coursewise | Day wise" switch under the summary card (like sastranet).
// `view` is "course" or "day". Tapping a tab calls onChangeView with the new view;
// App keeps the actual state.
function ViewTabs({ view, onChangeView }) {
  return (
    <div className="view-tabs" role="tablist">
      <button
        type="button"
        role="tab"
        aria-selected={view === 'course'}
        className={view === 'course' ? 'view-tab view-tab-active' : 'view-tab'}
        onClick={() => onChangeView('course')}
      >
        Coursewise
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={view === 'day'}
        className={view === 'day' ? 'view-tab view-tab-active' : 'view-tab'}
        onClick={() => onChangeView('day')}
      >
        Day wise
      </button>
    </div>
  )
}

export default ViewTabs
