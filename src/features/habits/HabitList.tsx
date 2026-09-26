import { useEffect, useState } from 'react'
import { Repeat } from 'lucide-react'
import type { Habit, HabitLog, NewHabit } from '../../db/types'
import { HabitForm } from './HabitForm'
import { HabitItem } from './HabitItem'
import { EmptyState } from '../../components/EmptyState'

function todayString(): string {
  return new Date().toISOString().split('T')[0]
}

export function HabitList() {
  const [habits, setHabits] = useState<Habit[]>([])
  const [logs, setLogs] = useState<HabitLog[]>([])
  const [loading, setLoading] = useState(true)

  async function refresh() {
    const [habitsData, logsData] = await Promise.all([
      window.planner.getHabits(),
      window.planner.getHabitLogs(),
    ])
    setHabits(habitsData)
    setLogs(logsData)
  }

  useEffect(() => {
    refresh().finally(() => setLoading(false))
  }, [])

  async function handleAdd(habit: NewHabit) {
    await window.planner.addHabit(habit)
    await refresh()
  }

  async function handleToggleToday(habitId: number, completed: boolean) {
    await window.planner.logHabitDay(habitId, todayString(), completed)
    await refresh()
  }

  async function handleDelete(id: number) {
    await window.planner.deleteHabit(id)
    await refresh()
  }

  if (loading) {
    return <p className="text-sm text-gray-400 p-4">Loading habits…</p>
  }

  const today = todayString()

  return (
    <div className="max-w-2xl mx-auto p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-800 tracking-tight">Habits</h1>
        <p className="text-sm text-gray-400 mt-1">Small, repeated things add up.</p>
      </div>

      <HabitForm onAdd={handleAdd} />

      <div className="space-y-2">
        {habits.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
            <EmptyState icon={Repeat} message="No habits yet — add one above." />
          </div>
        ) : (
          habits.map((habit) => (
            <HabitItem
              key={habit.id}
              habit={habit}
              todayLog={logs.find((l) => l.habitId === habit.id && l.date === today)}
              onToggleToday={handleToggleToday}
              onDelete={handleDelete}
            />
          ))
        )}
      </div>
    </div>
  )
}