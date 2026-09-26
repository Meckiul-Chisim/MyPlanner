// Purpose: A simple form for adding a new daily habit.
import { useState } from 'react'
import type { NewHabit } from '../../db/types'

interface HabitFormProps {
  onAdd: (habit: NewHabit) => void
}

export function HabitForm({ onAdd }: HabitFormProps) {
  const [name, setName] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return

    onAdd({ name: name.trim(), frequency: 'daily' })
    setName('')
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 p-4 bg-gray-50 rounded-lg">
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="New habit, e.g. Read 20 minutes"
        className="flex-1 px-3 py-2 text-sm rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
      />
      <button
        type="submit"
        className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700 transition-colors"
      >
        Add
      </button>
    </form>
  )
}