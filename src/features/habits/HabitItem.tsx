import { useEffect, useState } from 'react'
import { X, Flame, Check } from 'lucide-react'
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

  const done = todayLog?.completed ?? false

  return (
    <div className={`flex items-center gap-4 p-4 rounded-2xl border shadow-sm card-lift group ${
      done ? 'bg-primary-50/70 border-primary-100' : 'bg-white border-gray-100'
    }`}>
      <button
        onClick={() => onToggleToday(habit.id, !done)}
        className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all ${
          done ? 'bg-primary-600 border-primary-600 text-white' : 'bg-white border-gray-200 text-transparent hover:border-primary-300'
        }`}
        aria-label={done ? 'Mark habit incomplete' : 'Mark habit complete'}
      >
        <Check size={17} strokeWidth={2.5} />
      </button>
      <div className="flex-1">
        <p className={`text-sm font-semibold ${
          done ? 'text-primary-700 line-through' : 'text-gray-800'
        }`}>{habit.name}</p>
        <div className="flex items-center gap-1.5 mt-1">
          <Flame size={12} className={streak > 0 ? 'text-sand-500' : 'text-gray-300'} />
          <p className="text-xs text-sand-700 font-medium">{streak > 0 ? `${streak} day streak` : 'Start your streak today'}</p>
        </div>
      </div>
      <button onClick={() => onDelete(habit.id)} className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-300 hover:text-rose-500 hover:bg-rose-50 transition-all opacity-0 group-hover:opacity-100" aria-label="Delete habit"><X size={15}/></button>
    </div>
  )
}
