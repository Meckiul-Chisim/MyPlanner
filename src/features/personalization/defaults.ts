import type { NewHabit } from '../../db/types'

const DEFAULT_HABITS: NewHabit[] = [
  { name: 'Deep coding block', frequency: 'daily' },
  { name: 'Learn something new', frequency: 'daily' },
  { name: 'Create or publish', frequency: 'daily' },
  { name: 'Exercise / walk', frequency: 'daily' },
  { name: 'Plan tomorrow', frequency: 'daily' },
]

export async function ensurePersonalDefaults() {
  const existing = await window.planner.getHabits()
  const existingNames = new Set(existing.map((habit) => habit.name.trim().toLowerCase()))

  for (const habit of DEFAULT_HABITS) {
    if (existingNames.has(habit.name.toLowerCase())) continue
    await window.planner.addHabit(habit)
    existingNames.add(habit.name.toLowerCase())
  }
}
