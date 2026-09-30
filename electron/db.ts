// Purpose: Initialize and query the local SQLite database stored in app user data.
import initSqlJs from 'sql.js'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { app } from 'electron'
import type { Habit, HabitLog, ScheduleBlock, Task } from '../src/db/types'

type SqlDatabase = InstanceType<Awaited<ReturnType<typeof initSqlJs>>['Database']>

let db: SqlDatabase | undefined
let dbPath: string | undefined

function persistDatabase() {
  if (!db || !dbPath) return
  const bytes = db.export()
  if (bytes) writeFileSync(dbPath, Buffer.from(bytes))
}

function getRows<T>(sql: string, params?: Record<string, unknown> | unknown[]): T[] {
  const stmt = getDb().prepare(sql)
  if (params !== undefined) stmt.bind(params as never)

  const rows: T[] = []
  while (stmt.step()) {
    rows.push(stmt.getAsObject() as unknown as T)
  }

  stmt.free()
  return rows
}

function runStatement(sql: string, params?: Record<string, unknown> | unknown[]): number {
  const stmt = getDb().prepare(sql)
  if (params !== undefined) stmt.bind(params as never)
  stmt.step()
  stmt.free()

  const lastId = getDb().exec('SELECT last_insert_rowid() AS id')[0]?.values[0]?.[0]
  return typeof lastId === 'number' ? lastId : 0
}

export async function initDatabase() {
  const SQL = await initSqlJs()
  const resolvedPath = join(app.getPath('userData'), 'myplanner.db')
  dbPath = resolvedPath

  let database: SqlDatabase
  if (existsSync(resolvedPath)) {
    const bytes = readFileSync(resolvedPath)
    database = new SQL.Database(new Uint8Array(bytes))
  } else {
    database = new SQL.Database()
  }
  db = database

  database.exec(`
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

  persistDatabase()
}

export function getDb() {
  if (!db) throw new Error('The local database has not been initialized.')
  return db
}

// ---------- SCHEDULE BLOCK WRITE FUNCTIONS ----------

export function addScheduleBlock(block: {
  title: string
  startTime: string
  endTime: string
  date: string
  linkedTaskId?: number
}): number {
  return runStatement(
    `INSERT INTO schedule_blocks (title, start_time, end_time, date, linked_task_id)
     VALUES (?, ?, ?, ?, ?)`,
    [block.title, block.startTime, block.endTime, block.date, block.linkedTaskId ?? null],
  )
}

export function deleteScheduleBlock(id: number): void {
  runStatement('DELETE FROM schedule_blocks WHERE id = ?', [id])
  persistDatabase()
}

// ---------- READ FUNCTIONS ----------

export function getTasks(): Task[] {
  const rows = getRows<(Omit<Task, 'completed'> & { completed: number })>(`
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
  `)

  return rows.map((row) => ({ ...row, completed: Number(row.completed) === 1 }))
}

export function getHabits(): Habit[] {
  return getRows<Habit>(`
    SELECT
      id,
      name,
      frequency,
      streak_count AS streakCount,
      created_at AS createdAt
    FROM habits
    ORDER BY id
  `)
}

export function getHabitLogs(): HabitLog[] {
  const rows = getRows<(Omit<HabitLog, 'completed'> & { completed: number })>(`
    SELECT id, habit_id AS habitId, date, completed
    FROM habit_logs
    ORDER BY date, id
  `)

  return rows.map((row) => ({ ...row, completed: Number(row.completed) === 1 }))
}

export function getScheduleBlocks(): ScheduleBlock[] {
  return getRows<ScheduleBlock>(`
    SELECT
      id,
      title,
      start_time AS startTime,
      end_time AS endTime,
      date,
      linked_task_id AS linkedTaskId
    FROM schedule_blocks
    ORDER BY date, start_time, id
  `)
}

// ---------- TASK WRITE FUNCTIONS ----------

export function addTask(task: {
  title: string
  description?: string
  dueDate?: string
  priority?: string
  linkedHabitId?: number
}): number {
  const id = runStatement(
    `INSERT INTO tasks (title, description, due_date, priority, linked_habit_id)
     VALUES (?, ?, ?, ?, ?)`,
    [task.title, task.description ?? '', task.dueDate ?? null, task.priority ?? 'normal', task.linkedHabitId ?? null],
  )
  persistDatabase()
  return id
}

export function toggleTask(id: number): void {
  runStatement('UPDATE tasks SET completed = NOT completed WHERE id = ?', [id])
  persistDatabase()
}

export function deleteTask(id: number): void {
  runStatement('DELETE FROM tasks WHERE id = ?', [id])
  persistDatabase()
}

export function closeDatabase() {
  db?.close()
  db = undefined
  dbPath = undefined
}

// ---------- HABIT WRITE FUNCTIONS ----------

export function addHabit(habit: { name: string; frequency?: string }): number {
  const id = runStatement('INSERT INTO habits (name, frequency) VALUES (?, ?)', [habit.name, habit.frequency ?? 'daily'])
  persistDatabase()
  return id
}

export function deleteHabit(id: number): void {
  runStatement('DELETE FROM habits WHERE id = ?', [id])
  persistDatabase()
}

// Logs today (or a given date) as done/not done for a habit.
export function logHabitDay(habitId: number, date: string, completed: boolean): void {
  runStatement(
    `INSERT INTO habit_logs (habit_id, date, completed)
     VALUES (?, ?, ?)
     ON CONFLICT (habit_id, date) DO UPDATE SET completed = excluded.completed`,
    [habitId, date, completed ? 1 : 0],
  )
  persistDatabase()
}

// Computes a habit's current streak by walking backward from today through
// habit_logs, counting consecutive completed days.
export function getStreakForHabit(habitId: number): number {
  const logs = getRows<{ date: string; completed: number }>(`
    SELECT date, completed FROM habit_logs
    WHERE habit_id = ? AND completed = 1
    ORDER BY date DESC
  `, [habitId])

  if (logs.length === 0) return 0

  let streak = 0
  const cursor = new Date()

  for (const log of logs) {
    const expected = cursor.toISOString().split('T')[0]
    if (log.date === expected) {
      streak++
      cursor.setDate(cursor.getDate() - 1)
    } else {
      break
    }
  }

  return streak
}