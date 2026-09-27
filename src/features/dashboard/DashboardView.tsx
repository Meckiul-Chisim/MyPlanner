import { useEffect, useState } from 'react'
import { CalendarDays, CheckSquare, Repeat, Sparkles, ArrowRight, Clock3 } from 'lucide-react'
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
    return <div className="max-w-5xl mx-auto p-8"><div className="h-8 w-40 bg-gray-200/70 rounded-lg animate-pulse" /></div>
  }

  const dueTasks = tasks.filter((t) => isDueTodayOrOverdue(t, today))
  const completedTasks = tasks.filter((t) => t.completed).length
  const completedHabits = habits.filter((habit) => habitLogs.some((l) => l.habitId === habit.id && l.date === today && l.completed)).length
  const sortedBlocks = [...scheduleBlocks].sort((a, b) => a.startTime.localeCompare(b.startTime))
  const dateLabel = new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })

  return (
    <div className="max-w-5xl mx-auto p-5 sm:p-8 lg:p-10 space-y-7">
      <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-primary-50 border border-primary-100 px-3 py-1.5 text-[11px] font-semibold text-primary-700 mb-3">
            <Sparkles size={13} />
            Your daily overview
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Good day. Let’s make it count.</h1>
          <p className="text-sm text-gray-400 mt-2">{dateLabel}</p>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-xs text-gray-400 bg-white border border-gray-100 rounded-xl px-3 py-2 shadow-sm">
          <Clock3 size={14} />
          Everything in one place
        </div>
      </header>

      <section className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="glass-panel card-lift rounded-2xl border border-white shadow-sm p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Open tasks</span>
            <span className="w-9 h-9 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center"><CheckSquare size={17}/></span>
          </div>
          <p className="text-3xl font-bold text-gray-900 mt-4">{dueTasks.length}</p>
          <p className="text-xs text-gray-400 mt-1">{completedTasks} completed overall</p>
        </div>
        <div className="glass-panel card-lift rounded-2xl border border-white shadow-sm p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Habits today</span>
            <span className="w-9 h-9 rounded-xl bg-sand-100 text-sand-700 flex items-center justify-center"><Repeat size={17}/></span>
          </div>
          <p className="text-3xl font-bold text-gray-900 mt-4">{completedHabits}<span className="text-lg text-gray-300">/{habits.length}</span></p>
          <p className="text-xs text-gray-400 mt-1">Keep your rhythm going</p>
        </div>
        <div className="glass-panel card-lift rounded-2xl border border-white shadow-sm p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Time blocks</span>
            <span className="w-9 h-9 rounded-xl bg-lavender-100 text-lavender-700 flex items-center justify-center"><CalendarDays size={17}/></span>
          </div>
          <p className="text-3xl font-bold text-gray-900 mt-4">{sortedBlocks.length}</p>
          <p className="text-xs text-gray-400 mt-1">Planned for today</p>
        </div>
      </section>

      <section className="grid lg:grid-cols-2 gap-5">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden card-lift">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <div className="flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-lg bg-lavender-100 text-lavender-700 flex items-center justify-center"><CalendarDays size={15}/></span>
              <div><h2 className="text-sm font-bold text-gray-800">Today’s schedule</h2><p className="text-[11px] text-gray-400">Your time, mapped out</p></div>
            </div>
            <ArrowRight size={15} className="text-gray-300" />
          </div>
          <div className="p-3">
            {sortedBlocks.length === 0 ? (
              <p className="text-sm text-gray-400 p-4">Nothing scheduled yet.</p>
            ) : (
              <div className="space-y-2">
                {sortedBlocks.map((block) => (
                  <div key={block.id} className="flex items-center gap-3 p-3 rounded-xl bg-lavender-100/50 border border-lavender-100">
                    <span className="text-xs font-semibold text-lavender-700 w-14">{block.startTime}</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-lavender-500" />
                    <span className="text-sm text-gray-700 font-medium">{block.title}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden card-lift">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <div className="flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center"><CheckSquare size={15}/></span>
              <div><h2 className="text-sm font-bold text-gray-800">Focus for today</h2><p className="text-[11px] text-gray-400">Tasks that need your attention</p></div>
            </div>
            <span className="text-xs font-semibold text-primary-600">{dueTasks.length} open</span>
          </div>
          <div className="p-3">
            {dueTasks.length === 0 ? (
              <div className="p-5 text-center"><p className="text-sm font-semibold text-gray-600">You’re all clear.</p><p className="text-xs text-gray-400 mt-1">Enjoy the breathing room.</p></div>
            ) : (
              <div className="space-y-1">
                {dueTasks.map((task) => (
                  <label key={task.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors">
                    <input type="checkbox" checked={task.completed} onChange={() => handleToggleTask(task.id)} className="h-4 w-4 rounded border-gray-300 focus:ring-primary-500" />
                    <span className="flex-1 text-sm font-medium text-gray-700">{task.title}</span>
                    <span className="text-[10px] text-gray-400 uppercase font-semibold">{task.priority}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2.5">
          <span className="w-8 h-8 rounded-lg bg-sand-100 text-sand-700 flex items-center justify-center"><Repeat size={15}/></span>
          <div><h2 className="text-sm font-bold text-gray-800">Daily habits</h2><p className="text-[11px] text-gray-400">Small actions, repeated consistently</p></div>
        </div>
        {habits.length === 0 ? (
          <p className="text-sm text-gray-400 p-5">No habits set up yet.</p>
        ) : (
          <div className="p-3 grid sm:grid-cols-2 gap-2">
            {habits.map((habit) => {
              const todayLog = habitLogs.find((l) => l.habitId === habit.id && l.date === today)
              const done = todayLog?.completed ?? false
              return (
                <label key={habit.id} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                  done ? 'bg-primary-50 border-primary-100' : 'bg-gray-50/60 border-gray-100 hover:bg-gray-50'
                }`}>
                  <input type="checkbox" checked={done} onChange={(e) => handleToggleHabit(habit.id, e.target.checked)} className="h-4 w-4 rounded border-gray-300" />
                  <span className={`text-sm font-medium ${
                    done ? 'text-primary-700 line-through' : 'text-gray-700'
                  }`}>{habit.name}</span>
                </label>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}
