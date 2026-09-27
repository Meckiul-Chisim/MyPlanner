import { X } from 'lucide-react'
import type { ScheduleBlock } from '../../db/types'
import { timeToTopOffset, durationToHeight } from './timeUtils'

interface ScheduleBlockCardProps { block: ScheduleBlock; onDelete: (id: number) => void }

export function ScheduleBlockCard({ block, onDelete }: ScheduleBlockCardProps) {
  const top = timeToTopOffset(block.startTime)
  const height = durationToHeight(block.startTime, block.endTime)

  return (
    <div
      style={{ top: `${top}px`, height: `${height}px` }}
      className="absolute left-16 right-2 bg-lavender-100/80 border border-lavender-100 border-l-4 border-l-lavender-500 rounded-xl px-3 py-2 overflow-hidden group shadow-sm hover:shadow-md transition-shadow duration-200"
    >
      <p className="text-xs font-bold text-lavender-700 truncate">{block.title}</p>
      <p className="text-[10px] font-medium text-lavender-500 mt-0.5">{block.startTime} – {block.endTime}</p>
      <button onClick={() => onDelete(block.id)} className="absolute top-1 right-1 w-6 h-6 rounded-md flex items-center justify-center text-lavender-500 hover:text-rose-500 hover:bg-white/70 opacity-0 group-hover:opacity-100 transition-all" aria-label="Delete block"><X size={13}/></button>
    </div>
  )
}
