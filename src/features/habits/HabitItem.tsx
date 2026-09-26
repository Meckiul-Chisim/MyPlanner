import { useEffect, useState } from 'react'
import { X, Flame } from 'lucide-react'
import type { Habit, HabitLog } from '../../db/types'

interface HabitItemProps {
  habit: Habit
  todayLog: HabitLog | undefined
  onToggleToday: (habitId: number, completed: boolean) => void
  onDelete: (id: number) => void
}

export function HabitItem({ habit, todayLog, onToggleToday, onDelete }: HabitItemProps) {
  const [streak, setStreak] = useState(0)

  useEffect(() => {
    window.planner.getStreak(habit.id).then(setStreak)
  }, [habit.id, todayLog])

  return (
    <div className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200 group">
      <input
        type="checkbox"
        checked={todayLog?.completed ?? false}
        onChange={(e) => onToggleToday(habit.id, e.target.checked)}
        className="h-5 w-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
      />

      <div className="flex-1">
        <p className="text-sm font-medium text-gray-800">{habit.name}</p>
        <div className="flex items-center gap-1 mt-0.5">
          {streak > 0 && <Flame size={12} className="text-sand-500" />}
          <p className="text-xs text-sand-500 font-medium">
            {streak > 0 ? `${streak} day streak` : 'No streak yet'}
          </p>
        </div>
      </div>

      <button
        onClick={() => onDelete(habit.id)}
        className="text-gray-300 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100"
        aria-label="Delete habit"
      >
        <X size={15} />
      </button>
    </div>
  )
}