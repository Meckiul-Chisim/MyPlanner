import { useEffect, useState } from 'react'
import { Sidebar, type View } from './components/NavBar'
import { DashboardView } from './features/dashboard/DashboardView'
import { TaskList } from './features/tasks/TaskList'
import { HabitList } from './features/habits/HabitList'
import { ScheduleView } from './features/schedule/ScheduleView'
import { ensurePlannerStorage } from './db/localStorage'
import { ensureWeeklyRoutine } from './features/schedule/routine'
import { ensurePersonalDefaults } from './features/personalization/defaults'
import { SettingsView } from './features/settings/SettingsView'
import { ProfileView } from './features/profile/ProfileView'
import { MyPlannerLogo } from './components/MyPlannerLogo'

function App() {
  ensurePlannerStorage()

  const [showSplash, setShowSplash] = useState(true)

  useEffect(() => {
    ensureWeeklyRoutine().catch(() => undefined)
    ensurePersonalDefaults().catch(() => undefined)
    const timer = window.setTimeout(() => setShowSplash(false), 2200)
    return () => window.clearTimeout(timer)
  }, [])

  const [view, setView] = useState<View>('dashboard')

  return (
    <div className="app-shell relative flex h-screen overflow-hidden">
      {showSplash && (
        <div className="planner-splash" role="status" aria-label="Opening MyPlanner">
          <div className="splash-orbit orbit-a" />
          <div className="splash-orbit orbit-b" />
          <div className="splash-grid" aria-hidden="true" />
          <div className="splash-content">
            <div className="splash-logo-shell"><MyPlannerLogo size={82} /></div>
            <div className="splash-wordmark">MyPlanner</div>
            <p className="splash-tagline">Build your day. Build what matters.</p>
            <div className="splash-progress"><span /></div>
            <div className="splash-signals" aria-hidden="true">
              <span>BUILD</span><i /> <span>LEARN</span><i /> <span>CREATE</span><i /> <span>GROW</span>
            </div>
          </div>
        </div>
      )}
      <div className="ambient-bg" aria-hidden="true">
        <div className="smoke smoke-one" />
        <div className="smoke smoke-two" />
        <div className="smoke smoke-three" />
        <div className="ambient-orb orb-one" />
        <div className="ambient-orb orb-two" />
        <div className="floating-symbol symbol-one">&lt;/&gt;</div>
        <div className="floating-symbol symbol-two">✦</div>
        <div className="floating-symbol symbol-three">{'{}'}</div>
        <div className="floating-symbol symbol-four">+</div>
      </div>

      <div className="relative z-20 flex h-full min-w-0 w-full">
        <Sidebar active={view} onNavigate={setView} />
        <main className="app-main relative z-10 flex-1 min-w-0 overflow-y-auto">
          <div className="page-reveal" key={view}>
            {view === 'dashboard' && <DashboardView />}
            {view === 'tasks' && <TaskList />}
            {view === 'habits' && <HabitList />}
            {view === 'schedule' && <ScheduleView />}
            {view === 'profile' && <ProfileView />}
            {view === 'settings' && <SettingsView />}
          </div>
        </main>
      </div>
    </div>
  )
}

export default App
