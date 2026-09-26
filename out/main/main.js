import { app, BrowserWindow, ipcMain } from "electron";
import { join } from "node:path";
import Database from "better-sqlite3";
import __cjs_mod__ from "node:module";
const __filename = import.meta.filename;
const __dirname = import.meta.dirname;
const require2 = __cjs_mod__.createRequire(import.meta.url);
let db;
function initDatabase() {
  const dbPath = join(app.getPath("userData"), "myplanner.db");
  db = new Database(dbPath);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");
  db.exec(`
    CREATE TABLE IF NOT EXISTS habits (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      frequency TEXT NOT NULL DEFAULT 'daily',
      streak_count INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      due_date TEXT,
      priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high')),
      completed INTEGER NOT NULL DEFAULT 0 CHECK (completed IN (0, 1)),
      linked_habit_id INTEGER REFERENCES habits(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS habit_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      habit_id INTEGER NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
      date TEXT NOT NULL,
      completed INTEGER NOT NULL DEFAULT 0 CHECK (completed IN (0, 1)),
      UNIQUE (habit_id, date)
    );

    CREATE TABLE IF NOT EXISTS schedule_blocks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      start_time TEXT NOT NULL,
      end_time TEXT NOT NULL,
      date TEXT NOT NULL,
      linked_task_id INTEGER REFERENCES tasks(id) ON DELETE SET NULL
    );
  `);
}
function getDb() {
  if (!db) throw new Error("The local database has not been initialized.");
  return db;
}
function getTasks() {
  const rows = getDb().prepare(`
    SELECT
      id,
      title,
      description,
      due_date AS dueDate,
      priority,
      completed,
      linked_habit_id AS linkedHabitId
    FROM tasks
    ORDER BY due_date IS NULL, due_date, id
  `).all();
  return rows.map((row) => ({ ...row, completed: row.completed === 1 }));
}
function getHabits() {
  return getDb().prepare(`
    SELECT
      id,
      name,
      frequency,
      streak_count AS streakCount,
      created_at AS createdAt
    FROM habits
    ORDER BY id
  `).all();
}
function getHabitLogs() {
  const rows = getDb().prepare(`
    SELECT id, habit_id AS habitId, date, completed
    FROM habit_logs
    ORDER BY date, id
  `).all();
  return rows.map((row) => ({ ...row, completed: row.completed === 1 }));
}
function getScheduleBlocks() {
  return getDb().prepare(`
    SELECT
      id,
      title,
      start_time AS startTime,
      end_time AS endTime,
      date,
      linked_task_id AS linkedTaskId
    FROM schedule_blocks
    ORDER BY date, start_time, id
  `).all();
}
function addTask(task) {
  const result = getDb().prepare(`
    INSERT INTO tasks (title, description, due_date, priority, linked_habit_id)
    VALUES (@title, @description, @dueDate, @priority, @linkedHabitId)
  `).run({
    title: task.title,
    description: task.description ?? "",
    dueDate: task.dueDate ?? null,
    priority: task.priority ?? "normal",
    linkedHabitId: task.linkedHabitId ?? null
  });
  return result.lastInsertRowid;
}
function toggleTask(id) {
  getDb().prepare(`UPDATE tasks SET completed = NOT completed WHERE id = ?`).run(id);
}
function deleteTask(id) {
  getDb().prepare(`DELETE FROM tasks WHERE id = ?`).run(id);
}
function closeDatabase() {
  db?.close();
  db = void 0;
}
function addHabit(habit) {
  const result = getDb().prepare(`
    INSERT INTO habits (name, frequency) VALUES (@name, @frequency)
  `).run({
    name: habit.name,
    frequency: habit.frequency ?? "daily"
  });
  return result.lastInsertRowid;
}
function deleteHabit(id) {
  getDb().prepare(`DELETE FROM habits WHERE id = ?`).run(id);
}
function logHabitDay(habitId, date, completed) {
  getDb().prepare(`
    INSERT INTO habit_logs (habit_id, date, completed)
    VALUES (@habitId, @date, @completed)
    ON CONFLICT (habit_id, date) DO UPDATE SET completed = @completed
  `).run({ habitId, date, completed: completed ? 1 : 0 });
}
function getStreakForHabit(habitId) {
  const logs = getDb().prepare(`
    SELECT date, completed FROM habit_logs
    WHERE habit_id = ? AND completed = 1
    ORDER BY date DESC
  `).all(habitId);
  if (logs.length === 0) return 0;
  let streak = 0;
  const cursor = /* @__PURE__ */ new Date();
  for (const log of logs) {
    const expected = cursor.toISOString().split("T")[0];
    if (log.date === expected) {
      streak++;
      cursor.setDate(cursor.getDate() - 1);
    } else {
      break;
    }
  }
  return streak;
}
function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: join(__dirname, "../preload/preload.js"),
      contextIsolation: true,
      // keeps renderer sandboxed from Node.js — required for security
      nodeIntegration: false
      // React never touches Node.js APIs directly
    }
  });
  if (process.env.VITE_DEV_SERVER_URL) {
    win.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else {
    win.loadFile(join(__dirname, "../renderer/index.html"));
  }
}
function registerIpcHandlers() {
  ipcMain.handle("tasks:list", () => getTasks());
  ipcMain.handle("habits:list", () => getHabits());
  ipcMain.handle("habit-logs:list", () => getHabitLogs());
  ipcMain.handle("schedule-blocks:list", () => getScheduleBlocks());
  ipcMain.handle("tasks:add", (_event, task) => addTask(task));
  ipcMain.handle("tasks:toggle", (_event, id) => toggleTask(id));
  ipcMain.handle("tasks:delete", (_event, id) => deleteTask(id));
  ipcMain.handle("habits:add", (_event, habit) => addHabit(habit));
  ipcMain.handle("habits:delete", (_event, id) => deleteHabit(id));
  ipcMain.handle(
    "habits:logDay",
    (_event, args) => logHabitDay(args.habitId, args.date, args.completed)
  );
  ipcMain.handle("habits:getStreak", (_event, habitId) => getStreakForHabit(habitId));
}
app.whenReady().then(() => {
  initDatabase();
  registerIpcHandlers();
  createWindow();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});
app.on("window-all-closed", () => {
  closeDatabase();
  if (process.platform !== "darwin") app.quit();
});
