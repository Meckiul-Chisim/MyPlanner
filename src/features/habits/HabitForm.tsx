import { useState } from 'react'
import { Plus } from 'lucide-react'
import type { NewHabit } from '../../db/types'

interface HabitFormProps { onAdd: (habit: NewHabit) => void }

export function HabitForm({ onAdd }: HabitFormProps) {
  const [name, setName] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    onAdd({ name: name.trim(), frequency: 'daily' })
    setName('')
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-2 flex gap-2">
      <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Add a habit, e.g. Read 20 minutes" className="flex-1 px-3 py-2.5 text-sm bg-transparent focus:outline-none placeholder:text-gray-300" />
      <button type="submit" className="px-4 py-2.5 text-sm font-semibold text-white bg-primary-600 rounded-xl hover:bg-primary-700 transition-colors flex items-center gap-2"><Plus size={16}/> Add habit</button>
    </form>
  )
}
