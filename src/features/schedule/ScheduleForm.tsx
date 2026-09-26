// Purpose: Form for adding a new schedule block to the current day.
import { useState } from 'react'
import type { NewScheduleBlock } from '../../db/types'

interface ScheduleFormProps {
  date: string
  onAdd: (block: NewScheduleBlock) => void
}

export function ScheduleForm({ date, onAdd }: ScheduleFormProps) {
  const [title, setTitle] = useState('')
  const [startTime, setStartTime] = useState('09:00')
  const [endTime, setEndTime] = useState('10:00')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    if (startTime >= endTime) return // basic guard against invalid ranges

    onAdd({ title: title.trim(), startTime, endTime, date })
    setTitle('')
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap gap-2 p-4 bg-gray-50 rounded-lg mb-4">
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="What's happening?"
        className="flex-1 min-w-45 px-3 py-2 text-sm rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-lavender-500"
      />
      <input
        type="time"
        value={startTime}
        onChange={(e) => setStartTime(e.target.value)}
        className="px-3 py-2 text-sm rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-lavender-500"
      />
      <input
        type="time"
        value={endTime}
        onChange={(e) => setEndTime(e.target.value)}
        className="px-3 py-2 text-sm rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-lavender-500"
      />
      <button
        type="submit"
        className="px-4 py-2 text-sm font-medium text-white bg-lavender-500 rounded-md hover:bg-lavender-700 transition-colors"
      >
        Add
      </button>
    </form>
  )
}