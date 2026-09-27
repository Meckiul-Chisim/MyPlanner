import type { NewScheduleBlock, ScheduleBlock } from '../../db/types'
import { todayString } from './timeUtils'

const ROUTINE_DAYS = 14

function addDays(date: Date, days: number): Date {
  const next = new Date(date)
  next.setDate(next.getDate() + days)
  return next
}

function dateString(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function dayOfWeek(date: Date): number {
  return date.getDay()
}

function buildRoutine(date: string, day: number): NewScheduleBlock[] {
  const common = (title: string, startTime: string, endTime: string): NewScheduleBlock => ({
    title,
    startTime,
    endTime,
    date,
  })

  // Monday: market day with a lighter afternoon/evening workload.
  if (day === 1) {
    return [
      common('Market', '08:00', '12:30'),
      common('Lunch', '12:30', '13:30'),
      common('Rest', '13:30', '14:30'),
      common('Coding / project work', '14:30', '16:30'),
      common('Break', '16:30', '17:00'),
      common('Learning', '17:00', '18:00'),
      common('Exercise / walk', '18:00', '19:00'),
      common('Dinner + reset', '19:00', '20:00'),
      common('Content / light work', '20:00', '21:00'),
      common('Plan tomorrow', '21:00', '21:30'),
      common('Wind down', '21:30', '22:30'),
    ]
  }

  // Sunday: church + recovery. Lunch begins after church finishes.
  if (day === 0) {
    return [
      common('Morning routine', '06:30', '07:30'),
      common('Breakfast', '07:30', '08:30'),
      common('Get ready / travel', '08:30', '10:00'),
      common('Church service', '10:00', '12:30'),
      common('Lunch', '12:30', '13:30'),
      common('Rest', '13:30', '15:00'),
      common('Light learning', '15:00', '16:00'),
      common('Exercise / walk', '16:00', '17:00'),
      common('Free time', '17:00', '18:30'),
      common('Dinner', '18:30', '19:30'),
      common('Weekly review', '19:30', '20:30'),
      common('Plan Monday', '20:30', '21:00'),
      common('Wind down', '21:00', '22:30'),
    ]
  }

  // Tuesday–Saturday: main build days.
  return [
    common('Morning routine', '06:30', '07:15'),
    common('Breakfast', '07:15', '08:00'),
    common('Deep coding / main project', '08:00', '10:30'),
    common('Break', '10:30', '11:00'),
    common('Coding / implementation', '11:00', '12:30'),
    common('Lunch + rest', '12:30', '14:00'),
    common('Project building', '14:00', '16:00'),
    common('Break', '16:00', '16:30'),
    common('Learning', '16:30', '17:30'),
    common('Exercise / walk', '17:30', '18:30'),
    common('Shower + dinner', '18:30', '19:30'),
    common('Content / freelance / business', '19:30', '20:30'),
    common('Free time', '20:30', '21:00'),
    common('Review + plan tomorrow', '21:00', '21:30'),
    common('Wind down', '21:30', '22:30'),
  ]
}

function sameBlock(a: ScheduleBlock, b: NewScheduleBlock): boolean {
  return (
    a.date === b.date &&
    a.title === b.title &&
    a.startTime === b.startTime &&
    a.endTime === b.endTime
  )
}

let routineSeedPromise: Promise<void> | null = null

function sameBlockKey(block: ScheduleBlock): string {
  return block.date + '|' + block.startTime + '|' + block.endTime + '|' + block.title
}

async function seedWeeklyRoutine(): Promise<void> {
  const existing = await window.planner.getScheduleBlocks()
  const seen = new Set<string>()
  const duplicateIds: number[] = []

  for (const block of existing) {
    const key = sameBlockKey(block)
    if (seen.has(key)) duplicateIds.push(block.id)
    else seen.add(key)
  }

  for (const id of duplicateIds) {
    await window.planner.deleteScheduleBlock(id)
  }

  const existingBlocks = existing.filter((block) => !duplicateIds.includes(block.id))
  const start = new Date(todayString() + 'T00:00:00')

  for (let offset = 0; offset < ROUTINE_DAYS; offset += 1) {
    const date = addDays(start, offset)
    const blocks = buildRoutine(dateString(date), dayOfWeek(date))

    for (const block of blocks) {
      if (existingBlocks.some((item) => sameBlock(item, block))) continue
      await window.planner.addScheduleBlock(block)
      existingBlocks.push({
        ...block,
        id: -1,
        linkedTaskId: null,
      })
    }
  }
}

export async function ensureWeeklyRoutine() {
  if (routineSeedPromise) return routineSeedPromise

  routineSeedPromise = seedWeeklyRoutine().finally(() => {
    routineSeedPromise = null
  })

  return routineSeedPromise
}
