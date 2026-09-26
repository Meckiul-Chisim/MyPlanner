import { useState } from 'react'
import { Plus } from 'lucide-react'
import type { NewTask, Task } from '../../db/types'

interface TaskFormProps { onAdd: (task: NewTask) => void }

export function TaskForm({ onAdd }: TaskFormProps) {
  const [title, setTitle] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [priority, setPriority] = useState<Task['priority']>('normal')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    onAdd({ title: title.trim(), dueDate: dueDate || undefined, priority })
    setTitle('')
    setDueDate('')
    setPriority('normal')
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-2 flex flex-wrap gap-2">
      <div className="flex-1 min-w-52 flex items-center px-3">
        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="What do you want to get done?" className="w-full py-2.5 text-sm bg-transparent focus:outline-none placeholder:text-gray-300" />
      </div>
      <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="px-3 py-2.5 text-sm rounded-xl border border-gray-100 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-100" />
      <select value={priority} onChange={(e) => setPriority(e.target.value as Task['priority'])} className="px-3 py-2.5 text-sm rounded-xl border border-gray-100 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-100">
        <option value="low">Low priority</option><option value="normal">Normal priority</option><option value="high">High priority</option>
      </select>
      <button type="submit" className="px-4 py-2.5 text-sm font-semibold text-white bg-primary-600 rounded-xl hover:bg-primary-700 transition-colors flex items-center gap-2">
        <Plus size={16} /> Add task
      </button>
    </form>
  )
}
