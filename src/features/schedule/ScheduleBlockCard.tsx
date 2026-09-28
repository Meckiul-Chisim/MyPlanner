import { X } from 'lucide-react'
import type { ScheduleBlock } from '../../db/types'
import { timeToTopOffset, durationToHeight } from './timeUtils'

interface ScheduleBlockCardProps { block: ScheduleBlock; onDelete: (id: number) => void }

export function ScheduleBlockCard({ block, onDelete }: ScheduleBlockCardProps) {
  const sundayLunchVisualFix = block.title === 'Lunch + rest' && new Date(block.date + 'T00:00:00').getDay() === 0
  const top = timeToTopOffset(block.startTime) + (sundayLunchVisualFix ? 30 : 0)
  const height = Math.max(durationToHeight(block.startTime, block.endTime) - (sundayLunchVisualFix ? 30 : 0), 30)
  const displayStart = sundayLunchVisualFix ? '12:30' : block.startTime

  return (
    <div
      style={{ top: `${top}px`, height: `${height}px` }}
      className="absolute left-16 right-2 schedule-block schedule-block-card bg-primary-50 border border-primary-100 border-l-4 border-l-primary-600 rounded-xl px-3 py-2 overflow-hidden group shadow-sm hover:shadow-md transition-shadow duration-200"
    >
      <p className="text-xs font-bold text-primary-700 truncate">{block.title}</p>
      <p className="text-[10px] font-medium text-primary-600 mt-0.5">{displayStart} – {block.endTime}</p>
      <button onClick={() => onDelete(block.id)} className="absolute top-1 right-1 w-6 h-6 rounded-md flex items-center justify-center text-primary-600 hover:text-rose-500 hover:bg-white/70 opacity-0 group-hover:opacity-100 transition-all" aria-label="Delete block"><X size={13}/></button>
    </div>
  )
}
