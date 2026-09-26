import { X } from 'lucide-react'
import type { Task } from '../../db/types'

interface TaskItemProps {
  task: Task
  onToggle: (id: number) => void
  onDelete: (id: number) => void
}

const priorityColors: Record<Task['priority'], string> = {
  low: 'bg-sky-100 text-sky-500',
  normal: 'bg-primary-100 text-primary-700',
  high: 'bg-blush-100 text-blush-500',
}

export function TaskItem({ task, onToggle, onDelete }: TaskItemProps) {
  return (
    <div className="flex items-center gap-3 py-3.5 px-4 border-b border-gray-100 last:border-0 hover:bg-gray-50/60 transition-colors group">
      <input
        type="checkbox"
        checked={task.completed}
        onChange={() => onToggle(task.id)}
        className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
      />

      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium ${task.completed ? 'line-through text-gray-400' : 'text-gray-800'}`}>
          {task.title}
        </p>
        {task.description && (
          <p className="text-xs text-gray-400 truncate mt-0.5">{task.description}</p>
        )}
      </div>

      {task.dueDate && (
        <span className="text-xs text-gray-400">{task.dueDate}</span>
      )}

      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${priorityColors[task.priority]}`}>
        {task.priority}
      </span>

      <button
        onClick={() => onDelete(task.id)}
        className="text-gray-300 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100"
        aria-label="Delete task"
      >
        <X size={15} />
      </button>
    </div>
  )
}