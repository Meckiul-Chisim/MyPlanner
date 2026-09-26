import { X } from 'lucide-react'
import type { ScheduleBlock } from '../../db/types'
import { timeToTopOffset, durationToHeight } from './timeUtils'

interface ScheduleBlockCardProps {
  block: ScheduleBlock
  onDelete: (id: number) => void
}

export function ScheduleBlockCard({ block, onDelete }: ScheduleBlockCardProps) {
  const top = timeToTopOffset(block.startTime)
  const height = durationToHeight(block.startTime, block.endTime)

  return (
    <div
      style={{ top: `${top}px`, height: `${height}px` }}
      className="absolute left-16 right-2 bg-lavender-100 border-l-2 border-lavender-500 rounded-md px-3 py-1 overflow-hidden group shadow-sm hover:shadow-md transition-shadow duration-200"
    >
      <p className="text-xs font-medium text-lavender-700 truncate">{block.title}</p>
      <p className="text-[10px] text-lavender-500">{block.startTime} – {block.endTime}</p>

      <button
        onClick={() => onDelete(block.id)}
        className="absolute top-1 right-1 text-lavender-500 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity"
        aria-label="Delete block"
      >
        <X size={13} />
      </button>
    </div>
  )
}