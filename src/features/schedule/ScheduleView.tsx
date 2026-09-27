import { useEffect, useMemo, useState } from 'react'
import { CalendarDays, ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react'
import type { NewScheduleBlock, ScheduleBlock } from '../../db/types'
import { ScheduleForm } from './ScheduleForm'
import { ScheduleBlockCard } from './ScheduleBlockCard'
import { EmptyState } from '../../components/EmptyState'
import { HOUR_HEIGHT_PX, GRID_START_HOUR, GRID_END_HOUR, todayString } from './timeUtils'

function addDays(dateString: string, days: number) {
  const date = new Date(`${dateString}T00:00:00`)
  date.setDate(date.getDate() + days)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function formatDay(dateString: string) {
  return new Date(`${dateString}T00:00:00`).toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })
}

function shortDay(dateString: string) {
  return new Date(`${dateString}T00:00:00`).toLocaleDateString(undefined, {
    weekday: 'short',
    day: 'numeric',
  })
}

function dayContext(dateString: string) {
  const day = new Date(`${dateString}T00:00:00`).getDay()
  if (day === 1) return 'Market day'
  if (day === 0) return 'Church + reset'
  return 'Build day'
}

export function ScheduleView() {
  const [blocks, setBlocks] = useState<ScheduleBlock[]>([])
  const [loading, setLoading] = useState(true)
  const today = todayString()
  const [selectedDate, setSelectedDate] = useState(today)

  async function refresh() {
    const all = await window.planner.getScheduleBlocks()
    setBlocks(all)
  }

  useEffect(() => {
    refresh().finally(() => setLoading(false))
  }, [])

  async function handleAdd(block: NewScheduleBlock) {
    await window.planner.addScheduleBlock(block)
    await refresh()
  }

  async function handleDelete(id: number) {
    await window.planner.deleteScheduleBlock(id)
    await refresh()
  }

  const selectedBlocks = useMemo(
    () => blocks.filter((block) => block.date === selectedDate),
    [blocks, selectedDate],
  )

  const dayOptions = useMemo(
    () => Array.from({ length: 7 }, (_, index) => addDays(today, index)),
    [today],
  )

  if (loading) {
    return <p className="text-sm text-gray-400 p-4">Loading schedule…</p>
  }

  const hours = Array.from(
    { length: GRID_END_HOUR - GRID_START_HOUR + 1 },
    (_, i) => GRID_START_HOUR + i,
  )
  const gridHeight = hours.length * HOUR_HEIGHT_PX

  return (
    <div className="max-w-4xl mx-auto p-5 sm:p-8">
      <div className="mb-5">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-lavender-100 border border-lavender-200 px-3 py-1.5 text-[11px] font-semibold text-lavender-700 mb-3">
              <CalendarDays size={13} />
              Weekly routine
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
              {formatDay(selectedDate)}
            </h1>
            <p className="text-sm text-gray-400 mt-1">
              {dayContext(selectedDate)} · mapped around your real routine.
            </p>
          </div>
          {selectedDate !== today && (
            <button
              type="button"
              onClick={() => setSelectedDate(today)}
              className="inline-flex items-center gap-2 self-start sm:self-auto px-3 py-2 rounded-xl bg-white border border-gray-100 text-xs font-semibold text-gray-600 hover:bg-gray-50 shadow-sm"
            >
              <RotateCcw size={14} />
              Back to today
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1.5 mb-5">
        {dayOptions.map((date) => {
          const active = date === selectedDate
          const dateLabel = new Date(`${date}T00:00:00`)
          const day = dateLabel.getDay()
          const special = day === 1 || day === 0

          return (
            <button
              key={date}
              type="button"
              onClick={() => setSelectedDate(date)}
              className={`rounded-xl px-1 py-2.5 text-center border transition-all ${
                active
                  ? 'bg-gray-900 text-white border-gray-900 shadow-sm'
                  : special
                    ? 'bg-lavender-50 text-lavender-700 border-lavender-100 hover:bg-lavender-100'
                    : 'bg-white text-gray-500 border-gray-100 hover:bg-gray-50'
              }`}
            >
              <span className="block text-[10px] font-semibold uppercase opacity-70">
                {shortDay(date).split(' ')[0]}
              </span>
              <span className="block text-sm font-bold mt-0.5">
                {dateLabel.getDate()}
              </span>
              <span className="block text-[8px] mt-0.5 opacity-60 truncate">
                {dayContext(date)}
              </span>
            </button>
          )
        })}
      </div>

      <ScheduleForm date={selectedDate} onAdd={handleAdd} />

      <div
        className="relative bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
        style={{ height: `${gridHeight}px` }}
      >
        {selectedBlocks.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <EmptyState icon={CalendarDays} message="Nothing scheduled — add a block above." />
          </div>
        )}

        {hours.map((hour, i) => (
          <div
            key={hour}
            className="absolute left-0 right-0 border-t border-gray-100 flex items-start"
            style={{ top: `${i * HOUR_HEIGHT_PX}px` }}
          >
            <span className="text-[10px] text-gray-300 w-14 pl-2 -mt-2 bg-white">
              {hour === 12 ? '12 PM' : hour > 12 ? `${hour - 12} PM` : `${hour} AM`}
            </span>
          </div>
        ))}

        {selectedBlocks.map((block) => (
          <ScheduleBlockCard key={block.id} block={block} onDelete={handleDelete} />
        ))}
      </div>
    </div>
  )
}
