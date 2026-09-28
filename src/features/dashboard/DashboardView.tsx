import { useEffect, useMemo, useState } from 'react'
import {
  ArrowRight,
  CalendarDays,
  CheckSquare,
  Code2,
  Clock3,
  Compass,
  Dumbbell,
  Repeat,
  Sparkles,
  TrendingUp,
  Video,
} from 'lucide-react'
import type { Habit, HabitLog, ScheduleBlock, Task } from '../../db/types'
import { todayString } from '../schedule/timeUtils'
import { getPlannerProfile, type PlannerProfile } from '../profile/profile'

function isDueTodayOrOverdue(task: Task, today: string): boolean {
  if (task.completed || !task.dueDate) return false
  return task.dueDate <= today
}

function getDayPlan() {
  const day = new Date().getDay()
  if (day === 1) {
    return {
      eyebrow: 'Monday · Market day',
      title: 'Start steady, then build.',
      description: 'Handle the market first, then protect the afternoon for coding and learning.',
    }
  }
  if (day === 0) {
    return {
      eyebrow: 'Sunday · Church + reset',
      title: 'Slow down and reset.',
      description: 'Make space for church, rest, reflection and a lighter learning session.',
    }
  }
  return {
    eyebrow: 'Build day · Tuesday–Saturday',
    title: 'Build something that moves you forward.',
    description: 'Use your focused blocks for development, learning, content and your next online-income step.',
  }
}

export function DashboardView() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [habits, setHabits] = useState<Habit[]>([])
  const [habitLogs, setHabitLogs] = useState<HabitLog[]>([])
  const [scheduleBlocks, setScheduleBlocks] = useState<ScheduleBlock[]>([])
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<PlannerProfile>(() => getPlannerProfile())

  const today = todayString()
  const dayPlan = useMemo(getDayPlan, [])

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
    setScheduleBlocks(allBlocks.filter((block) => block.date === today))
  }

  useEffect(() => {
    refresh().finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    const handleProfileUpdate = () => setProfile(getPlannerProfile())
    window.addEventListener('myplanner-profile-updated', handleProfileUpdate)
    return () => window.removeEventListener('myplanner-profile-updated', handleProfileUpdate)
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

  const dueTasks = tasks.filter((task) => isDueTodayOrOverdue(task, today))
  const completedTasks = tasks.filter((task) => task.completed).length
  const completedHabits = habits.filter((habit) =>
    habitLogs.some((log) => log.habitId === habit.id && log.date === today && log.completed),
  ).length
  const sortedBlocks = [...scheduleBlocks].sort((a, b) => a.startTime.localeCompare(b.startTime))
  const dateLabel = new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })
  const openHabitCount = Math.max(habits.length - completedHabits, 0)

  return (
    <div className="max-w-5xl mx-auto p-5 sm:p-8 lg:p-10 space-y-7">
      <header className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-primary-50 border border-primary-100 px-3 py-1.5 text-[11px] font-semibold text-primary-700 mb-3">
            <Sparkles size={13} />
            {dayPlan.eyebrow}
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900">
            Hey {profile.name || 'there'}. Let’s build.
          </h1>
          <p className="text-sm text-gray-400 mt-2">{dateLabel} · {dayPlan.description}</p>
          <p className="text-xs text-gray-500 mt-2 font-medium">{profile.primaryFocus} · {profile.role}</p>
        </div>
        <div className="glass-panel rounded-2xl border border-white shadow-sm px-4 py-3 min-w-52">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-gray-300">Today's intention</p>
          <p className="text-sm font-bold text-gray-800 mt-1">{dayPlan.title}</p>
        </div>
      </header>

      <section className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="glass-panel card-lift rounded-2xl border border-white shadow-sm p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Focus tasks</span>
            <span className="w-9 h-9 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center"><CheckSquare size={17} /></span>
          </div>
          <p className="text-3xl font-bold text-gray-900 mt-4">{dueTasks.length}</p>
          <p className="text-xs text-gray-400 mt-1">{completedTasks} completed overall</p>
        </div>

        <div className="glass-panel card-lift rounded-2xl border border-white shadow-sm p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Daily rhythm</span>
            <span className="w-9 h-9 rounded-xl bg-sand-100 text-sand-700 flex items-center justify-center"><Repeat size={17} /></span>
          </div>
          <p className="text-3xl font-bold text-gray-900 mt-4">{completedHabits}<span className="text-lg text-gray-300">/{habits.length}</span></p>
          <p className="text-xs text-gray-400 mt-1">{openHabitCount} habit{openHabitCount === 1 ? '' : 's'} left today</p>
        </div>

        <div className="glass-panel card-lift rounded-2xl border border-white shadow-sm p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Time protected</span>
            <span className="w-9 h-9 rounded-xl bg-lavender-100 text-lavender-700 flex items-center justify-center"><CalendarDays size={17} /></span>
          </div>
          <p className="text-3xl font-bold text-gray-900 mt-4">{sortedBlocks.length}</p>
          <p className="text-xs text-gray-400 mt-1">blocks mapped for today</p>
        </div>
      </section>

      <section>
        <div className="flex items-end justify-between mb-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-gray-300">Your four lanes</p>
            <h2 className="text-lg font-bold text-gray-800 mt-1">Keep the bigger picture visible.</h2>
          </div>
          <Compass size={18} className="text-gray-300" />
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { icon: Code2, title: 'Build', text: profile.lanes.build, className: 'bg-primary-50 text-primary-700 border-primary-100' },
            { icon: Compass, title: 'Learn', text: profile.lanes.learn, className: 'bg-sky-100/60 text-sky-700 border-sky-100' },
            { icon: Video, title: 'Create', text: profile.lanes.create, className: 'bg-blush-100/70 text-blush-700 border-blush-100' },
            { icon: TrendingUp, title: 'Grow', text: profile.lanes.grow, className: 'bg-lavender-100/70 text-lavender-700 border-lavender-100' },
          ].map((lane) => {
            const Icon = lane.icon
            return (
              <div key={lane.title} className={`rounded-2xl border p-4 card-lift ${
                lane.className
              }`}>
                <Icon size={18} strokeWidth={2} />
                <p className="text-sm font-bold mt-3">{lane.title}</p>
                <p className="text-[11px] mt-1 opacity-70 leading-relaxed">{lane.text}</p>
              </div>
            )
          })}
        </div>
      </section>

      <section className="grid lg:grid-cols-2 gap-5">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden card-lift">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <div className="flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-lg bg-lavender-100 text-lavender-700 flex items-center justify-center"><CalendarDays size={15} /></span>
              <div><h2 className="text-sm font-bold text-gray-800">Today’s map</h2><p className="text-[11px] text-gray-400">Follow the rhythm, not every minute.</p></div>
            </div>
            <Clock3 size={15} className="text-gray-300" />
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
              <span className="w-8 h-8 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center"><CheckSquare size={15} /></span>
              <div><h2 className="text-sm font-bold text-gray-800">Today’s focus</h2><p className="text-[11px] text-gray-400">The few things worth your attention.</p></div>
            </div>
            <span className="text-xs font-semibold text-primary-600">{dueTasks.length} open</span>
          </div>
          <div className="p-3">
            {dueTasks.length === 0 ? (
              <div className="p-5 text-center"><p className="text-sm font-semibold text-gray-600">Your task list is clear.</p><p className="text-xs text-gray-400 mt-1">Use the space for learning, building or creating.</p></div>
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
          <span className="w-8 h-8 rounded-lg bg-sand-100 text-sand-700 flex items-center justify-center"><Dumbbell size={15} /></span>
          <div><h2 className="text-sm font-bold text-gray-800">Your daily rhythm</h2><p className="text-[11px] text-gray-400">Small actions that support the bigger goals.</p></div>
        </div>
        {habits.length === 0 ? (
          <p className="text-sm text-gray-400 p-5">No habits set up yet.</p>
        ) : (
          <div className="p-3 grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {habits.map((habit) => {
              const todayLog = habitLogs.find((log) => log.habitId === habit.id && log.date === today)
              const done = todayLog?.completed ?? false
              return (
                <label key={habit.id} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                  done ? 'bg-primary-50 border-primary-100' : 'bg-gray-50/60 border-gray-100 hover:bg-gray-50'
                }`}>
                  <input type="checkbox" checked={done} onChange={(event) => handleToggleHabit(habit.id, event.target.checked)} className="h-4 w-4 rounded border-gray-300" />
                  <span className={`text-sm font-medium ${
                    done ? 'text-primary-700 line-through' : 'text-gray-700'
                  }`}>{habit.name}</span>
                </label>
              )
            })}
          </div>
        )}
      </section>

      <section className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden card-lift">
        <div className="px-5 py-4 border-b border-gray-100">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[10px] uppercase tracking-[0.16em] text-gray-300 font-bold">About this workspace</p>
              <h2 className="text-base font-bold text-gray-800 mt-1">{profile.role || 'Your personal workspace'}</h2>
            </div>
            <span className="w-9 h-9 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center"><Sparkles size={16} /></span>
          </div>
        </div>
        <div className="p-5">
          <p className="text-sm text-gray-600 leading-relaxed">{profile.bio || 'Add a short description in Settings → Your profile.'}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {profile.interests.slice(0, 5).map((interest) => (
              <span key={interest} className="rounded-full bg-gray-50 border border-gray-100 px-3 py-1.5 text-[11px] font-semibold text-gray-600">{interest}</span>
            ))}
          </div>
          {profile.goals.length > 0 && (
            <div className="mt-4">
              <p className="text-[10px] uppercase tracking-[0.16em] text-gray-300 font-bold">Current goals</p>
              <p className="text-xs text-gray-500 mt-2">{profile.goals.slice(0, 2).join(' · ')}</p>
            </div>
          )}
        </div>
      </section>

      <section className="rounded-2xl bg-gray-900 text-white p-5 sm:p-6 shadow-lg">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
            <ArrowRight size={18} />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.16em] text-white/45 font-bold">Keep it simple</p>
            <h2 className="text-base font-bold mt-1">One meaningful build. One learning win. One step toward growth.</h2>
            <p className="text-xs text-white/55 mt-2 leading-relaxed">You are juggling development, learning, content and business. MyPlanner is now organized around those lanes instead of treating every task as equally important.</p>
          </div>
        </div>
      </section>
    </div>
  )
}
