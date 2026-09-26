import { useEffect, useState } from 'react'
import { CalendarDays, CheckSquare, Repeat, Sparkles } from 'lucide-react'
import type { Habit, HabitLog, ScheduleBlock, Task } from '../../db/types'
import { todayString } from '../schedule/timeUtils'

function isDueTodayOrOverdue(task: Task, today: string): boolean {
  if (task.completed) return false
  if (!task.dueDate) return false
  return task.dueDate <= today
}

export function DashboardView() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [habits, setHabits] = useState<Habit[]>([])
  const [habitLogs, setHabitLogs] = useState<HabitLog[]>([])
  const [scheduleBlocks, setScheduleBlocks] = useState<ScheduleBlock[]>([])
  const [loading, setLoading] = useState(true)

  const today = todayString()

  async function refresh() {
    const [allTasks, allHabits, allLogs, allBlocks] = await Promise.all([
      window.planner.getTasks(),
      window.planner.getHabits(),
      window.planner.getHabitLogs(),
      window.planner.getScheduleBlocks(),
    ])
    setTasks(allTasks)
    setHabits(allHabits)
    setHabitLogs(allLogs)
    setScheduleBlocks(allBlocks.filter((b) => b.date === today))
  }

  useEffect(() => {
    refresh().finally(() => setLoading(false))
  }, [])

  async function handleToggleTask(id: number) {
    await window.planner.toggleTask(id)
    await refresh()
  }

  async function handleToggleHabit(habitId: number, completed: boolean) {
    await window.planner.logHabitDay(habitId, today, completed)
    await refresh()
  }

  if (loading) {
    return <p className="text-sm text-gray-400 p-6">Loading today…</p>
  }

  const dueTasks = tasks.filter((t) => isDueTodayOrOverdue(t, today))
  const sortedBlocks = [...scheduleBlocks].sort((a, b) => a.startTime.localeCompare(b.startTime))

  return (
    <div className="max-w-3xl mx-auto p-8 space-y-9">
      <div className="flex items-center gap-2">
        <Sparkles size={20} className="text-primary-500" strokeWidth={1.8} />
        <div>
          <h1 className="text-2xl font-semibold text-gray-800 tracking-tight">Today</h1>
          <p className="text-sm text-gray-400">
            {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </div>
      </div>

      {/* Schedule section */}
      <section>
        <div className="flex items-center gap-1.5 mb-3">
          <CalendarDays size={13} className="text-lavender-500" />
          <h2 className="text-xs font-semibold text-lavender-700 uppercase tracking-wider">Schedule</h2>
        </div>
        {sortedBlocks.length === 0 ? (
          <p className="text-sm text-gray-400">Nothing scheduled today.</p>
        ) : (
          <div className="space-y-1.5">
            {sortedBlocks.map((block) => (
              <div
                key={block.id}
                className="flex items-center gap-3 py-2.5 px-4 bg-white rounded-lg border-l-2 border-lavender-500 border-y border-r border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200"
              >
                <span className="text-xs text-lavender-500 w-20 font-medium">{block.startTime}</span>
                <span className="text-sm text-gray-700">{block.title}</span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Tasks section */}
      <section>
        <div className="flex items-center gap-1.5 mb-3">
          <CheckSquare size={13} className="text-primary-600" />
          <h2 className="text-xs font-semibold text-primary-700 uppercase tracking-wider">
            Due Today {dueTasks.length > 0 && `(${dueTasks.length})`}
          </h2>
        </div>
        {dueTasks.length === 0 ? (
          <p className="text-sm text-gray-400">Nothing due — you're clear.</p>
        ) : (
          <div className="space-y-1.5">
            {dueTasks.map((task) => (
              <label
                key={task.id}
                className="flex items-center gap-3 py-2.5 px-4 bg-white rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={() => handleToggleTask(task.id)}
                  className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm text-gray-700">{task.title}</span>
              </label>
            ))}
          </div>
        )}
      </section>

      {/* Habits section */}
      <section>
        <div className="flex items-center gap-1.5 mb-3">
          <Repeat size={13} className="text-sand-500" />
          <h2 className="text-xs font-semibold text-sand-500 uppercase tracking-wider">Habits</h2>
        </div>
        {habits.length === 0 ? (
          <p className="text-sm text-gray-400">No habits set up yet.</p>
        ) : (
          <div className="space-y-1.5">
            {habits.map((habit) => {
              const todayLog = habitLogs.find((l) => l.habitId === habit.id && l.date === today)
              return (
                <label
                  key={habit.id}
                  className="flex items-center gap-3 py-2.5 px-4 bg-white rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={todayLog?.completed ?? false}
                    onChange={(e) => handleToggleHabit(habit.id, e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm text-gray-700">{habit.name}</span>
                </label>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}