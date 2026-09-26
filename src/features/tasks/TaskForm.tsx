// Purpose: A small form for adding a new task. Calls onAdd with the entered
// values and resets itself after submission.
import { useState } from 'react'
import type { NewTask, Task } from '../../db/types'

interface TaskFormProps {
  onAdd: (task: NewTask) => void
}

export function TaskForm({ onAdd }: TaskFormProps) {
  const [title, setTitle] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [priority, setPriority] = useState<Task['priority']>('normal')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return // don't add empty tasks

    onAdd({
      title: title.trim(),
      dueDate: dueDate || undefined,
      priority,
    })

    // Reset the form for the next entry
    setTitle('')
    setDueDate('')
    setPriority('normal')
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap gap-2 p-4 bg-gray-50 rounded-lg">
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="What needs to get done?"
        className="flex-1 min-w-50 px-3 py-2 text-sm rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
      />

      <input
        type="date"
        value={dueDate}
        onChange={(e) => setDueDate(e.target.value)}
        className="px-3 py-2 text-sm rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
      />

      <select
        value={priority}
        onChange={(e) => setPriority(e.target.value as Task['priority'])}
        className="px-3 py-2 text-sm rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
      >
        <option value="low">Low</option>
        <option value="normal">Normal</option>
        <option value="high">High</option>
      </select>

      <button
        type="submit"
        className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700 transition-colors"
      >
        Add
      </button>
    </form>
  )
}