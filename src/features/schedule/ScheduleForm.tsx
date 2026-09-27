import { useState } from 'react'
import { Plus } from 'lucide-react'
import type { NewScheduleBlock } from '../../db/types'

interface ScheduleFormProps { date: string; onAdd: (block: NewScheduleBlock) => void }

export function ScheduleForm({ date, onAdd }: ScheduleFormProps) {
  const [title, setTitle] = useState('')
  const [startTime, setStartTime] = useState('09:00')
  const [endTime, setEndTime] = useState('10:00')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim() || startTime >= endTime) return
    onAdd({ title: title.trim(), startTime, endTime, date })
    setTitle('')
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-2 flex flex-wrap gap-2 mb-5">
      <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="What are you doing?" className="flex-1 min-w-48 px-3 py-2.5 text-sm bg-transparent focus:outline-none placeholder:text-gray-300" />
      <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="px-3 py-2.5 text-sm rounded-xl border border-gray-100 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-100" />
      <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className="px-3 py-2.5 text-sm rounded-xl border border-gray-100 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-lavender-100" />
      <button type="submit" className="schedule-add-button px-4 py-2.5 text-sm font-semibold text-white rounded-xl flex items-center gap-2"><Plus size={16}/> Add block</button>
    </form>
  )
}
