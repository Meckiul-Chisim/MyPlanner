import { useEffect, useState } from 'react'
import { CalendarDays } from 'lucide-react'
import type { NewScheduleBlock, ScheduleBlock } from '../../db/types'
import { ScheduleForm } from './ScheduleForm'
import { ScheduleBlockCard } from './ScheduleBlockCard'
import { EmptyState } from '../../components/EmptyState'
import { HOUR_HEIGHT_PX, GRID_START_HOUR, GRID_END_HOUR, todayString } from './timeUtils'

export function ScheduleView() {
  const [blocks, setBlocks] = useState<ScheduleBlock[]>([])
  const [loading, setLoading] = useState(true)
  const date = todayString()

  async function refresh() {
    const all = await window.planner.getScheduleBlocks()
    setBlocks(all.filter((b) => b.date === date))
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

  if (loading) {
    return <p className="text-sm text-gray-400 p-4">Loading schedule…</p>
  }

  const hours = Array.from(
    { length: GRID_END_HOUR - GRID_START_HOUR + 1 },
    (_, i) => GRID_START_HOUR + i
  )
  const gridHeight = hours.length * HOUR_HEIGHT_PX

  return (
    <div className="max-w-3xl mx-auto p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-800 tracking-tight">Schedule</h1>
        <p className="text-sm text-gray-400 mt-1">Today, mapped out hour by hour.</p>
      </div>

      <ScheduleForm date={date} onAdd={handleAdd} />

      <div
        className="relative bg-white rounded-xl border border-gray-100 shadow-sm"
        style={{ height: `${gridHeight}px` }}
      >
        {blocks.length === 0 && (
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

        {blocks.map((block) => (
          <ScheduleBlockCard key={block.id} block={block} onDelete={handleDelete} />
        ))}
      </div>
    </div>
  )
}