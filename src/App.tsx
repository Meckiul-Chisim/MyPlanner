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

function App() {
  ensurePlannerStorage()

  useEffect(() => {
    ensureWeeklyRoutine().catch(() => undefined)
    ensurePersonalDefaults().catch(() => undefined)
  }, [])

  const [view, setView] = useState<View>('dashboard')

  return (
    <div className="app-shell relative flex h-screen overflow-hidden">
      <div className="ambient-bg" aria-hidden="true">
        <div className="smoke smoke-one" />
        <div className="smoke smoke-two" />
        <div className="smoke smoke-three" />
        <div className="ambient-orb orb-one" />
        <div className="ambient-orb orb-two" />
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
