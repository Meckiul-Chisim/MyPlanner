// Purpose: Left-hand sidebar navigation between the app's main sections.
import { useEffect, useMemo, useState } from 'react'
import {
  CalendarDays,
  CheckSquare,
  LayoutGrid,
  Plus,
  Repeat,
  Settings,
  ShieldCheck,
  UserRound,
  X,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { getPlannerProfile } from '../features/profile/profile'

export type View = 'dashboard' | 'tasks' | 'habits' | 'schedule' | 'profile' | 'settings'

interface SidebarProps {
  active: View
  onNavigate: (view: View) => void
}

type NavItem = {
  id: View
  label: string
  icon: LucideIcon
  hint: string
}

const workspaceItems: NavItem[] = [
  { id: 'dashboard', label: 'Today', icon: LayoutGrid, hint: 'Overview' },
  { id: 'tasks', label: 'Tasks', icon: CheckSquare, hint: 'To-do list' },
  { id: 'habits', label: 'Habits', icon: Repeat, hint: 'Daily rhythm' },
  { id: 'schedule', label: 'Schedule', icon: CalendarDays, hint: 'Time blocks' },
  { id: 'settings', label: 'Settings', icon: Settings, hint: 'Preferences' },
]

const mobileItems: NavItem[] = [
  ...workspaceItems,
  { id: 'profile', label: 'Profile', icon: UserRound, hint: 'Your details' },
]

export function Sidebar({ active, onNavigate }: SidebarProps) {
  const [profile, setProfile] = useState(() => getPlannerProfile())
  const [showPrivacyToast, setShowPrivacyToast] = useState(true)

  useEffect(() => {
    const sync = () => setProfile(getPlannerProfile())
    window.addEventListener('myplanner-profile-updated', sync)
    return () => window.removeEventListener('myplanner-profile-updated', sync)
  }, [])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setShowPrivacyToast(false)
    }, 4500)

    return () => window.clearTimeout(timer)
  }, [])

  const initials = useMemo(() => {
    const words = profile.name.trim().split(/\s+/).filter(Boolean)

    if (words.length > 1) {
      return words
        .slice(0, 2)
        .map((word) => word[0])
        .join('')
        .toUpperCase()
    }

    return profile.name.slice(0, 2).toUpperCase() || 'M'
  }, [profile.name])

  const renderItem = (item: NavItem) => {
    const Icon = item.icon
    const isActive = active === item.id

    return (
      <button
        key={item.id}
        type="button"
        onClick={() => onNavigate(item.id)}
        className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-all duration-150 group ${
          isActive ? 'sidebar-active shadow-sm' : 'sidebar-item'
        }`}
      >
        <span
          className={`w-8 h-8 rounded-lg flex items-center justify-center ${
            isActive ? 'sidebar-icon-active' : 'sidebar-icon'
          }`}
        >
          <Icon size={17} strokeWidth={isActive ? 2.2 : 1.8} />
        </span>

        <span className="sidebar-item-copy flex-1">
          <span className="block text-sm font-semibold">{item.label}</span>
          <span className="block text-[10px] mt-0.5 text-gray-400">{item.hint}</span>
        </span>
      </button>
    )
  }

  return (
    <aside className="app-sidebar w-64 h-full bg-white/90 backdrop-blur-xl border-r border-gray-200/70 flex flex-col shrink-0">
      <div className="sidebar-brand px-5 pt-6 pb-5">
        <div className="flex items-center gap-3">
          <div className="sidebar-logo relative w-10 h-10 rounded-2xl flex items-center justify-center text-white">
            <span className="text-lg font-bold">M</span>
            <span className="sidebar-logo-dot absolute -right-0.5 -top-0.5 w-2.5 h-2.5 rounded-full border-2" />
          </div>

          <div>
            <p className="text-[15px] font-bold sidebar-heading tracking-tight">MyPlanner</p>
            <p className="text-[11px] sidebar-muted mt-0.5">Plan a calmer day</p>
          </div>
        </div>
      </div>

      <div className="sidebar-action px-4 pb-4">
        <button
          type="button"
          onClick={() => onNavigate('tasks')}
          className="sidebar-new-task w-full flex items-center justify-center gap-2 rounded-xl text-white py-2.5 text-sm font-semibold"
        >
          <Plus size={16} />
          New task
        </button>
      </div>

      <nav className="sidebar-nav flex-1 px-3 space-y-1">
        <p className="sidebar-workspace-label px-3 pt-1 pb-2 text-[10px] font-bold uppercase tracking-[0.16em] sidebar-label">
          Workspace
        </p>
        {workspaceItems.map(renderItem)}
      </nav>

      <nav className="sidebar-mobile-nav" aria-label="Mobile navigation">
        {mobileItems.map(renderItem)}
      </nav>

      <div className="sidebar-bottom px-3 pb-3">
        <button
          type="button"
          onClick={() => onNavigate('profile')}
          className={`sidebar-profile-card w-full rounded-2xl border p-3 text-left ${
            active === 'profile' ? 'sidebar-profile-active' : ''
          }`}
        >
          <span className="sidebar-profile-avatar">
            {profile.avatar ? (
              <img src={profile.avatar} alt="" />
            ) : (
              <span>{initials}</span>
            )}
          </span>

          <span className="sidebar-profile-copy">
            <span className="block text-sm font-bold sidebar-heading truncate">
              {profile.name || 'Your profile'}
            </span>
            <span className="block text-[10px] sidebar-muted mt-0.5 truncate">
              {profile.role || 'Add your role'}
            </span>
          </span>

          <UserRound className="sidebar-profile-arrow" size={15} />
        </button>
      </div>

      {showPrivacyToast && (
        <div className="privacy-toast" role="status" aria-live="polite">
          <span className="privacy-toast-icon">
            <ShieldCheck size={16} />
          </span>

          <span className="privacy-toast-copy">
            <strong>Private by default</strong>
            <span>Your planner data stays stored locally on this device.</span>
          </span>

          <button
            type="button"
            className="privacy-toast-close"
            onClick={() => setShowPrivacyToast(false)}
            aria-label="Dismiss privacy notice"
          >
            <X size={14} />
          </button>
        </div>
      )}
    </aside>
  )
}
