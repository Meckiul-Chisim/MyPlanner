// Purpose: Left-hand sidebar navigation between the app's main sections.
import { LayoutGrid, CheckSquare, Repeat, CalendarDays, Plus } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export type View = 'dashboard' | 'tasks' | 'habits' | 'schedule'

interface SidebarProps {
  active: View
  onNavigate: (view: View) => void
}

const items: { id: View; label: string; icon: LucideIcon; hint: string }[] = [
  { id: 'dashboard', label: 'Today', icon: LayoutGrid, hint: 'Overview' },
  { id: 'tasks', label: 'Tasks', icon: CheckSquare, hint: 'To-do list' },
  { id: 'habits', label: 'Habits', icon: Repeat, hint: 'Daily rhythm' },
  { id: 'schedule', label: 'Schedule', icon: CalendarDays, hint: 'Time blocks' },
]

export function Sidebar({ active, onNavigate }: SidebarProps) {
  return (
    <aside className="w-64 h-full bg-white/90 backdrop-blur-xl border-r border-gray-200/70 flex flex-col shrink-0">
      <div className="px-5 pt-6 pb-5">
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-10 rounded-2xl bg-primary-600 flex items-center justify-center text-white shadow-lg shadow-primary-600/15">
            <span className="text-lg font-bold">M</span>
            <span className="absolute -right-0.5 -top-0.5 w-2.5 h-2.5 rounded-full bg-primary-300 border-2 border-white" />
          </div>
          <div>
            <p className="text-[15px] font-bold text-gray-800 tracking-tight">MyPlanner</p>
            <p className="text-[11px] text-gray-400 mt-0.5">Plan a calmer day</p>
          </div>
        </div>
      </div>

      <div className="px-4 pb-4">
        <button
          onClick={() => onNavigate('tasks')}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary-600 text-white py-2.5 text-sm font-semibold shadow-sm hover:bg-primary-700 active:scale-[0.99] transition-all"
        >
          <Plus size={16} />
          New task
        </button>
      </div>

      <nav className="flex-1 px-3 space-y-1">
        <p className="px-3 pt-1 pb-2 text-[10px] font-bold uppercase tracking-[0.16em] text-gray-300">
          Workspace
        </p>
        {items.map((item) => {
          const Icon = item.icon
          const isActive = active === item.id
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-all duration-150 group ${
                isActive
                  ? 'bg-primary-50 text-primary-700 shadow-sm'
                  : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'
              }`}
            >
              <span className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                isActive ? 'bg-white text-primary-600 shadow-sm' : 'bg-gray-50 text-gray-400 group-hover:text-gray-600'
              }`}>
                <Icon size={17} strokeWidth={isActive ? 2.2 : 1.8} />
              </span>
              <span className="flex-1">
                <span className="block text-sm font-semibold">{item.label}</span>
                <span className="block text-[10px] mt-0.5 text-gray-400">{item.hint}</span>
              </span>
            </button>
          )
        })}
      </nav>

      <div className="m-3 p-3 rounded-2xl bg-gray-50 border border-gray-100">
        <p className="text-[10px] font-semibold text-gray-500">Private by default</p>
        <p className="text-[10px] text-gray-400 mt-1 leading-relaxed">Your planner data stays stored locally on this device.</p>
      </div>
    </aside>
  )
}
