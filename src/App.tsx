// Purpose: App root — sidebar stays fixed to the viewport height; only the
// active section's content area scrolls independently.
import { useState } from 'react'
import { Sidebar, type View } from './components/NavBar'
import { DashboardView } from './features/dashboard/DashboardView'
import { TaskList } from './features/tasks/TaskList'
import { HabitList } from './features/habits/HabitList'
import { ScheduleView } from './features/schedule/ScheduleView'

function App() {
  const [view, setView] = useState<View>('dashboard')

  return (
    <div className="app-shell flex h-screen overflow-hidden">
      <Sidebar active={view} onNavigate={setView} />

      <main className="flex-1 min-w-0 overflow-y-auto">
        {view === 'dashboard' && <DashboardView />}
        {view === 'tasks' && <TaskList />}
        {view === 'habits' && <HabitList />}
        {view === 'schedule' && <ScheduleView />}
      </main>
    </div>
  )
}

export default App
