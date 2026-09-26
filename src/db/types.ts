// Purpose: Shared TypeScript types for planner data, used by both the
// Electron main process (electron/db.ts) and the React frontend.

// ---------- DATA MODELS ----------
// These represent rows as they're returned to the frontend — camelCase,
// matching the column aliases used in db.ts's SELECT queries.

export interface NewScheduleBlock {
  title: string
  startTime: string
  endTime: string
  date: string
  linkedTaskId?: number
}

export interface Task {
  id: number
  title: string
  description: string
  dueDate: string | null
  priority: 'low' | 'normal' | 'high'
  completed: boolean
  linkedHabitId: number | null
}

export interface Habit {
  id: number
  name: string
  frequency: string
  streakCount: number
  createdAt: string
}

export interface HabitLog {
  id: number
  habitId: number
  date: string
  completed: boolean
}

export interface ScheduleBlock {
  id: number
  title: string
  startTime: string
  endTime: string
  date: string
  linkedTaskId: number | null
}

// ---------- WRITE PAYLOADS ----------
// Shape of data sent FROM the frontend TO the database when creating records.
// Only fields the user actually provides — id, completed, etc. are set by the DB.

export interface NewTask {
  title: string
  description?: string
  dueDate?: string
  priority?: 'low' | 'normal' | 'high'
  linkedHabitId?: number
}

// ---------- PRELOAD API CONTRACT ----------
// This is the single source of truth for what `window.planner` exposes.
// preload.ts must implement this exactly, and main.ts's IPC handlers must
// match these signatures.

export interface NewHabit {
  name: string
  frequency?: string
}

export interface NewScheduleBlock {
  title: string
  startTime: string
  endTime: string
  date: string
  linkedTaskId?: number
}

export interface PlannerApi {
  // Reads
  getTasks: () => Promise<Task[]>
  getHabits: () => Promise<Habit[]>
  getHabitLogs: () => Promise<HabitLog[]>
  getScheduleBlocks: () => Promise<ScheduleBlock[]>

  // Task writes
  addTask: (task: NewTask) => Promise<number>
  toggleTask: (id: number) => Promise<void>
  deleteTask: (id: number) => Promise<void>

  // Habit writes
  addHabit: (habit: NewHabit) => Promise<number>
  deleteHabit: (id: number) => Promise<void>
  logHabitDay: (habitId: number, date: string, completed: boolean) => Promise<void>
  getStreak: (habitId: number) => Promise<number>

  // Schedule writes
  addScheduleBlock: (block: NewScheduleBlock) => Promise<number>
  deleteScheduleBlock: (id: number) => Promise<void>
}

// ---------- GLOBAL WINDOW TYPE ----------
// Lets TypeScript know `window.planner` exists in React components,
// without this you'd get "Property 'planner' does not exist on type 'Window'".
declare global {
  interface Window {
    planner: PlannerApi
  }
}