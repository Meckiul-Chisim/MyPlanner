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
  const blocks: NewScheduleBlock[] = [
    {
      title: 'Morning medication — as prescribed',
      startTime: '08:00',
      endTime: '08:15',
      date,
    },
    {
      title: 'Breakfast + morning routine',
      startTime: '08:15',
      endTime: '09:00',
      date,
    },
    {
      title: 'Coding / focused work',
      startTime: '09:00',
      endTime: '12:00',
      date,
    },
    {
      title: 'Lunch + rest',
      startTime: '12:00',
      endTime: '14:00',
      date,
    },
    {
      title: 'Coding / learning',
      startTime: '14:00',
      endTime: '17:00',
      date,
    },
    {
      title: 'Exercise / walk',
      startTime: '17:00',
      endTime: '18:00',
      date,
    },
    {
      title: 'Dinner + reset',
      startTime: '19:00',
      endTime: '20:00',
      date,
    },
    {
      title: 'Night medication — as prescribed',
      startTime: '20:00',
      endTime: '20:15',
      date,
    },
    {
      title: 'Wind down',
      startTime: '20:30',
      endTime: '22:00',
      date,
    },
  ]

  if (day === 1) {
    return [
      blocks[0],
      {
        title: 'Market',
        startTime: '08:00',
        endTime: '12:30',
        date,
      },
      blocks[3],
      blocks[4],
      blocks[5],
      blocks[6],
      blocks[7],
      blocks[8],
    ]
  }

  if (day === 0) {
    return [
      blocks[0],
      {
        title: 'Church service',
        startTime: '10:00',
        endTime: '12:30',
        date,
      },
      blocks[3],
      blocks[4],
      blocks[5],
      blocks[6],
      blocks[7],
      blocks[8],
    ]
  }

  return blocks
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
