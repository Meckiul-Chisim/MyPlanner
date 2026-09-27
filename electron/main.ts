// Purpose: Create the app window and register all IPC handlers that bridge
// React (renderer) requests to the local SQLite database.
import { app, BrowserWindow, dialog, ipcMain, Notification } from 'electron'
import { join } from 'node:path'
import { autoUpdater } from 'electron-updater'
import {
  initDatabase,
  closeDatabase,
  getTasks,
  getHabits,
  getHabitLogs,
  getScheduleBlocks,
  addTask,
  toggleTask,
  deleteTask,
  addHabit,
  deleteHabit,
  logHabitDay,
  getStreakForHabit,
  addScheduleBlock,
  deleteScheduleBlock,
} from './db'
import type { NewHabit, NewScheduleBlock, NewTask } from '../src/db/types'

const REMINDER_MINUTES = 10
const notifiedReminders = new Set<string>()
let reminderTimer: NodeJS.Timeout | undefined

function formatReminderTime(date: Date) {
  return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
}

function checkScheduleReminders() {
  if (!Notification.isSupported()) return

  const now = new Date()
  const today = now.toISOString().slice(0, 10)
  const currentMinutes = now.getHours() * 60 + now.getMinutes()

  for (const block of getScheduleBlocks().filter((item) => item.date === today)) {
    const [hours, minutes] = block.startTime.split(':').map(Number)
    const startMinutes = hours * 60 + minutes
    const reminderKey = `${block.id}-${today}-${block.startTime}`
    const minutesUntilStart = startMinutes - currentMinutes

    if (minutesUntilStart === REMINDER_MINUTES && !notifiedReminders.has(reminderKey)) {
      notifiedReminders.add(reminderKey)

      new Notification({
        title: `Up next · ${block.title}`,
        body: `Starts at ${formatReminderTime(new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes))}`,
        silent: false,
      }).show()
    }
  }

  // Keep the in-memory set small across long-running app sessions.
  if (notifiedReminders.size > 500) notifiedReminders.clear()
}

function startScheduleReminders() {
  checkScheduleReminders()
  reminderTimer = setInterval(checkScheduleReminders, 30_000)
}

app.whenReady().then(() => {
  initDatabase()
  registerIpcHandlers()
  createWindow()
  startScheduleReminders()

  // Check GitHub Releases for a newer version on every app launch
  autoUpdater.checkForUpdatesAndNotify()
})

// Fires once a newer version has finished downloading in the background
autoUpdater.on('update-downloaded', () => {
  dialog.showMessageBox({
    type: 'info',
    title: 'Update ready',
    message: 'A new version of MyPlanner has been downloaded. Restart now to apply it?',
    buttons: ['Restart', 'Later'],
  }).then((result) => {
    if (result.response === 0) {
      autoUpdater.quitAndInstall() // closes and reopens the app with the update applied
    }
  })
})

ipcMain.handle('schedule-blocks:add', (_event, block: NewScheduleBlock) => addScheduleBlock(block))
ipcMain.handle('schedule-blocks:delete', (_event, id: number) => deleteScheduleBlock(id))

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
  if (reminderTimer) clearInterval(reminderTimer)
  closeDatabase()
  if (process.platform !== 'darwin') app.quit()
})
