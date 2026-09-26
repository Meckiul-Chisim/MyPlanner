// Purpose: Initialize and query the local SQLite database stored in app user data.
import Database from 'better-sqlite3'
import { join } from 'node:path'
import { app } from 'electron'
import type { Habit, HabitLog, ScheduleBlock, Task } from '../src/db/types'

// ---------- SCHEDULE BLOCK WRITE FUNCTIONS ----------

export function addScheduleBlock(block: {
  title: string
  startTime: string  // 'HH:MM', 24-hour format
  endTime: string
  date: string        // 'YYYY-MM-DD'
  linkedTaskId?: number
}): number {
  const result = getDb().prepare(`
    INSERT INTO schedule_blocks (title, start_time, end_time, date, linked_task_id)
    VALUES (@title, @startTime, @endTime, @date, @linkedTaskId)
  `).run({
    title: block.title,
    startTime: block.startTime,
    endTime: block.endTime,
    date: block.date,
    linkedTaskId: block.linkedTaskId ?? null,
  })
  return result.lastInsertRowid as number
}

export function deleteScheduleBlock(id: number): void {
  getDb().prepare(`DELETE FROM schedule_blocks WHERE id = ?`).run(id)
}

let db: Database.Database | undefined

export function initDatabase() {
  const dbPath = join(app.getPath('userData'), 'myplanner.db')
  db = new Database(dbPath)
  db.pragma('journal_mode = WAL')
  db.pragma('foreign_keys = ON')

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
  `)
}

export function getDb() {
  if (!db) throw new Error('The local database has not been initialized.')
  return db
}

// ---------- READ FUNCTIONS ----------

export function getTasks(): Task[] {
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
  `).all() as Array<Omit<Task, 'completed'> & { completed: number }>

  return rows.map((row) => ({ ...row, completed: row.completed === 1 }))
}

export function getHabits(): Habit[] {
  return getDb().prepare(`
    SELECT
      id,
      name,
      frequency,
      streak_count AS streakCount,
      created_at AS createdAt
    FROM habits
    ORDER BY id
  `).all() as Habit[]
}

export function getHabitLogs(): HabitLog[] {
  const rows = getDb().prepare(`
    SELECT id, habit_id AS habitId, date, completed
    FROM habit_logs
    ORDER BY date, id
  `).all() as Array<Omit<HabitLog, 'completed'> & { completed: number }>

  return rows.map((row) => ({ ...row, completed: row.completed === 1 }))
}

export function getScheduleBlocks(): ScheduleBlock[] {
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
  `).all() as ScheduleBlock[]
}

// ---------- TASK WRITE FUNCTIONS ----------

export function addTask(task: {
  title: string
  description?: string
  dueDate?: string
  priority?: string
  linkedHabitId?: number
}): number {
  const result = getDb().prepare(`
    INSERT INTO tasks (title, description, due_date, priority, linked_habit_id)
    VALUES (@title, @description, @dueDate, @priority, @linkedHabitId)
  `).run({
    title: task.title,
    description: task.description ?? '',
    dueDate: task.dueDate ?? null,
    priority: task.priority ?? 'normal',
    linkedHabitId: task.linkedHabitId ?? null,
  })
  return result.lastInsertRowid as number
}

export function toggleTask(id: number): void {
  getDb().prepare(`UPDATE tasks SET completed = NOT completed WHERE id = ?`).run(id)
}

export function deleteTask(id: number): void {
  getDb().prepare(`DELETE FROM tasks WHERE id = ?`).run(id)
}

export function closeDatabase() {
  db?.close()
  db = undefined
}

// ---------- HABIT WRITE FUNCTIONS ----------

export function addHabit(habit: { name: string; frequency?: string }): number {
  const result = getDb().prepare(`
    INSERT INTO habits (name, frequency) VALUES (@name, @frequency)
  `).run({
    name: habit.name,
    frequency: habit.frequency ?? 'daily',
  })
  return result.lastInsertRowid as number
}

export function deleteHabit(id: number): void {
  // habit_logs are cleaned up automatically via ON DELETE CASCADE
  getDb().prepare(`DELETE FROM habits WHERE id = ?`).run(id)
}

// Logs today (or a given date) as done/not done for a habit.
// Uses INSERT ... ON CONFLICT to update the row if today was already logged,
// since (habit_id, date) is UNIQUE — this avoids a separate "check then insert" step.
export function logHabitDay(habitId: number, date: string, completed: boolean): void {
  getDb().prepare(`
    INSERT INTO habit_logs (habit_id, date, completed)
    VALUES (@habitId, @date, @completed)
    ON CONFLICT (habit_id, date) DO UPDATE SET completed = @completed
  `).run({ habitId, date, completed: completed ? 1 : 0 })
}

// Computes a habit's current streak by walking backward from today through
// habit_logs, counting consecutive completed days. Stops at the first gap.
// This is computed fresh each time rather than stored, so it can never drift
// out of sync with the actual log history.
export function getStreakForHabit(habitId: number): number {
  const logs = getDb().prepare(`
    SELECT date, completed FROM habit_logs
    WHERE habit_id = ? AND completed = 1
    ORDER BY date DESC
  `).all(habitId) as Array<{ date: string; completed: number }>

  if (logs.length === 0) return 0

  let streak = 0
  const cursor = new Date()

  for (const log of logs) {
    const expected = cursor.toISOString().split('T')[0] // 'YYYY-MM-DD'
    if (log.date === expected) {
      streak++
      cursor.setDate(cursor.getDate() - 1) // move one day earlier
    } else {
      break // gap found, streak ends here
    }
  }

  return streak
}