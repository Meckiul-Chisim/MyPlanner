// Purpose: Left-hand sidebar navigation between the app's main sections.
import { LayoutGrid, CheckSquare, Repeat, CalendarDays } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export type View = 'dashboard' | 'tasks' | 'habits' | 'schedule'

interface SidebarProps {
  active: View
  onNavigate: (view: View) => void
}

const items: { id: View; label: string; icon: LucideIcon }[] = [
  { id: 'dashboard', label: 'Today', icon: LayoutGrid },
  { id: 'tasks', label: 'Tasks', icon: CheckSquare },
  { id: 'habits', label: 'Habits', icon: Repeat },
  { id: 'schedule', label: 'Schedule', icon: CalendarDays },
]

export function Sidebar({ active, onNavigate }: SidebarProps) {
  return (
    <aside className="w-56 h-full bg-white border-r border-gray-100 flex flex-col">
      <div className="px-6 py-5">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-primary-600 flex items-center justify-center text-white text-sm font-semibold">
            M
          </div>
          <span className="text-sm font-semibold text-gray-800 tracking-tight">MyPlanner</span>
        </div>
      </div>

      <nav className="flex-1 px-3 space-y-1">
        {items.map((item) => {
          const Icon = item.icon
          const isActive = active === item.id
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-all duration-150 text-left ${
                isActive
                  ? 'bg-primary-100 text-primary-700'
                  : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50 hover:translate-x-0.5'
              }`}
            >
              <Icon size={17} strokeWidth={isActive ? 2.2 : 1.8} />
              {item.label}
            </button>
          )
        })}
      </nav>

      <div className="px-6 py-4 text-xs text-gray-300">Stored locally on this device</div>
    </aside>
  )
}