// Saved plans ("scenarios"), e.g. "Diwali trip" or "Hackathon week".
// A scenario is just a name plus the list of marked lecture keys:
//   { name: "Diwali trip", plannedKeys: ["2026-10-20#1", "2026-10-20#2", ...] }
// Plans are kept in the browser's localStorage, so they stay on this phone only.
// Nothing is ever sent to SWI: the real attendance data stays read-only.

const STORAGE_KEY = 'leave-planner.savedPlans'

// Read the saved list. If nothing is saved yet, or the saved text is broken, start empty.
export function readSavedScenarios() {
  try {
    const text = localStorage.getItem(STORAGE_KEY)
    if (text === null) {
      return []
    }
    const list = JSON.parse(text)
    return Array.isArray(list) ? list : []
  } catch {
    return []
  }
}

// Write the whole list back. localStorage can only store text, so we turn it into JSON.
export function writeSavedScenarios(list) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
}

// True if a plan with this name (ignoring capitals and spaces at the ends) already exists.
export function hasScenario(list, name) {
  const wanted = name.trim().toLowerCase()
  return list.some((scenario) => scenario.name.toLowerCase() === wanted)
}

// Save a plan under a name. Same name again = update that plan instead of adding a copy.
// Returns a NEW list; the old one is not changed.
export function saveScenario(list, name, plannedKeys) {
  const cleanName = name.trim()
  const scenario = { name: cleanName, plannedKeys: [...plannedKeys] }

  if (hasScenario(list, cleanName)) {
    return list.map((s) => (s.name.toLowerCase() === cleanName.toLowerCase() ? scenario : s))
  }
  return [...list, scenario]
}

// Remove a plan by name. Returns a NEW list.
export function deleteScenario(list, name) {
  return list.filter((scenario) => scenario.name !== name)
}
