import type {
  Habit,
  HabitLog,
  NewHabit,
  NewScheduleBlock,
  NewTask,
  PlannerApi,
  ScheduleBlock,
  Task,
} from './types'

const STORAGE_KEY = 'myplanner-storage-v1'

interface StorageState {
  tasks: Task[]
  habits: Habit[]
  habitLogs: HabitLog[]
  scheduleBlocks: ScheduleBlock[]
  nextId: number
}

const emptyState = (): StorageState => ({
  tasks: [],
  habits: [],
  habitLogs: [],
  scheduleBlocks: [],
  nextId: 1,
})

function readState(): StorageState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return emptyState()
    const parsed = JSON.parse(raw) as Partial<StorageState>
    return {
      tasks: Array.isArray(parsed.tasks) ? parsed.tasks : [],
      habits: Array.isArray(parsed.habits) ? parsed.habits : [],
      habitLogs: Array.isArray(parsed.habitLogs) ? parsed.habitLogs : [],
      scheduleBlocks: Array.isArray(parsed.scheduleBlocks) ? parsed.scheduleBlocks : [],
      nextId: typeof parsed.nextId === 'number' ? parsed.nextId : 1,
    }
  } catch {
    return emptyState()
  }
}

function writeState(state: StorageState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

function nextId(state: StorageState): number {
  const id = state.nextId
  state.nextId += 1
  return id
}

function getStreak(habitId: number, logs: HabitLog[]): number {
  const completedDates = new Set(
    logs.filter((log) => log.habitId === habitId && log.completed).map((log) => log.date),
  )
  let streak = 0
  const cursor = new Date()
  while (completedDates.has(cursor.toISOString().split('T')[0])) {
    streak += 1
    cursor.setDate(cursor.getDate() - 1)
  }
  return streak
}

const localPlanner: PlannerApi = {
  getTasks: async () => readState().tasks,
  getHabits: async () => readState().habits,
  getHabitLogs: async () => readState().habitLogs,
  getScheduleBlocks: async () => readState().scheduleBlocks,

  addTask: async (task: NewTask) => {
    const state = readState()
    const id = nextId(state)
    state.tasks.push({
      id,
      title: task.title,
      description: task.description ?? '',
      dueDate: task.dueDate ?? null,
      priority: task.priority ?? 'normal',
      completed: false,
      linkedHabitId: task.linkedHabitId ?? null,
    })
    writeState(state)
    return id
  },

  toggleTask: async (id: number) => {
    const state = readState()
    const task = state.tasks.find((item) => item.id === id)
    if (task) task.completed = !task.completed
    writeState(state)
  },

  deleteTask: async (id: number) => {
    const state = readState()
    state.tasks = state.tasks.filter((task) => task.id !== id)
    state.scheduleBlocks = state.scheduleBlocks.map((block) =>
      block.linkedTaskId === id ? { ...block, linkedTaskId: null } : block,
    )
    writeState(state)
  },

  addHabit: async (habit: NewHabit) => {
    const state = readState()
    const id = nextId(state)
    state.habits.push({
      id,
      name: habit.name,
      frequency: habit.frequency ?? 'daily',
      streakCount: 0,
      createdAt: new Date().toISOString(),
    })
    writeState(state)
    return id
  },

  deleteHabit: async (id: number) => {
    const state = readState()
    state.habits = state.habits.filter((habit) => habit.id !== id)
    state.habitLogs = state.habitLogs.filter((log) => log.habitId !== id)
    state.tasks = state.tasks.map((task) =>
      task.linkedHabitId === id ? { ...task, linkedHabitId: null } : task,
    )
    writeState(state)
  },

  logHabitDay: async (habitId: number, date: string, completed: boolean) => {
    const state = readState()
    const existing = state.habitLogs.find((log) => log.habitId === habitId && log.date === date)
    if (existing) existing.completed = completed
    else state.habitLogs.push({ id: nextId(state), habitId, date, completed })

    const habit = state.habits.find((item) => item.id === habitId)
    if (habit) habit.streakCount = getStreak(habitId, state.habitLogs)
    writeState(state)
  },

  getStreak: async (habitId: number) => getStreak(habitId, readState().habitLogs),

  addScheduleBlock: async (block: NewScheduleBlock) => {
    const state = readState()
    const id = nextId(state)
    state.scheduleBlocks.push({
      id,
      title: block.title,
      startTime: block.startTime,
      endTime: block.endTime,
      date: block.date,
      linkedTaskId: block.linkedTaskId ?? null,
    })
    writeState(state)
    return id
  },

  deleteScheduleBlock: async (id: number) => {
    const state = readState()
    state.scheduleBlocks = state.scheduleBlocks.filter((block) => block.id !== id)
    writeState(state)
  },
}

export function ensurePlannerStorage() {
  if (typeof window === 'undefined' || window.planner) return
  window.planner = localPlanner
}
