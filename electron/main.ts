import { app, BrowserWindow, ipcMain } from 'electron'
import { join } from 'node:path'
import {
  initDatabase, closeDatabase, getTasks, getHabits, getHabitLogs, getScheduleBlocks,
  addTask, toggleTask, deleteTask, addHabit, deleteHabit, logHabitDay,
  getStreakForHabit, addScheduleBlock, deleteScheduleBlock,
} from './db'
import type { NewHabit, NewTask, NewScheduleBlock } from '../src/db/types'

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: join(__dirname, '../preload/preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  })

  if (process.env.VITE_DEV_SERVER_URL) win.loadURL(process.env.VITE_DEV_SERVER_URL)
  else win.loadFile(join(__dirname, '../renderer/index.html'))
}

function registerIpcHandlers() {
  ipcMain.handle('tasks:list', () => getTasks())
  ipcMain.handle('habits:list', () => getHabits())
  ipcMain.handle('habit-logs:list', () => getHabitLogs())
  ipcMain.handle('schedule-blocks:list', () => getScheduleBlocks())
  ipcMain.handle('tasks:add', (_event, task: NewTask) => addTask(task))
  ipcMain.handle('tasks:toggle', (_event, id: number) => toggleTask(id))
  ipcMain.handle('tasks:delete', (_event, id: number) => deleteTask(id))
  ipcMain.handle('habits:add', (_event, habit: NewHabit) => addHabit(habit))
  ipcMain.handle('habits:delete', (_event, id: number) => deleteHabit(id))
  ipcMain.handle('habits:logDay', (_event, args: { habitId: number; date: string; completed: boolean }) =>
    logHabitDay(args.habitId, args.date, args.completed))
  ipcMain.handle('habits:getStreak', (_event, id: number) => getStreakForHabit(id))
  ipcMain.handle('schedule-blocks:add', (_event, block: NewScheduleBlock) => addScheduleBlock(block))
  ipcMain.handle('schedule-blocks:delete', (_event, id: number) => deleteScheduleBlock(id))
}

app.whenReady().then(() => {
  initDatabase()
  registerIpcHandlers()
  createWindow()
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  closeDatabase()
  if (process.platform !== 'darwin') app.quit()
})
