// Purpose: Expose a small, typed database API without giving React Node.js access.
import { contextBridge, ipcRenderer } from 'electron'
import type { NewHabit, NewScheduleBlock, NewTask, PlannerApi } from '../src/db/types'

const plannerApi: PlannerApi = {
  // Reads
  getTasks: () => ipcRenderer.invoke('tasks:list'),
  getHabits: () => ipcRenderer.invoke('habits:list'),
  getHabitLogs: () => ipcRenderer.invoke('habit-logs:list'),
  getScheduleBlocks: () => ipcRenderer.invoke('schedule-blocks:list'),

  // Task writes
  addTask: (task: NewTask) => ipcRenderer.invoke('tasks:add', task),
  toggleTask: (id: number) => ipcRenderer.invoke('tasks:toggle', id),
  deleteTask: (id: number) => ipcRenderer.invoke('tasks:delete', id),

  // Habit writes
  addHabit: (habit: NewHabit) => ipcRenderer.invoke('habits:add', habit),
  deleteHabit: (id: number) => ipcRenderer.invoke('habits:delete', id),
  logHabitDay: (habitId: number, date: string, completed: boolean) =>
    ipcRenderer.invoke('habits:logDay', { habitId, date, completed }),
  getStreak: (habitId: number) => ipcRenderer.invoke('habits:getStreak', habitId),

  // Schedule writes
  addScheduleBlock: (block: NewScheduleBlock) => ipcRenderer.invoke('schedule-blocks:add', block),
  deleteScheduleBlock: (id: number) => ipcRenderer.invoke('schedule-blocks:delete', id),
}

contextBridge.exposeInMainWorld('planner', plannerApi)