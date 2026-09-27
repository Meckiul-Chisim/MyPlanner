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
  const existingNames = new Set<string>()
  const duplicateIds: number[] = []

  for (const habit of existing) {
    const key = habit.name.trim().toLowerCase()
    if (existingNames.has(key)) duplicateIds.push(habit.id)
    else existingNames.add(key)
  }

  for (const id of duplicateIds) {
    await window.planner.deleteHabit(id)
  }

  for (const habit of DEFAULT_HABITS) {
    if (existingNames.has(habit.name.toLowerCase())) continue
    await window.planner.addHabit(habit)
    existingNames.add(habit.name.toLowerCase())
  }
}
