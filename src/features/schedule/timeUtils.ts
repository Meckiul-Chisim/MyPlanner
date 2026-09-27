// Purpose: Convert between 'HH:MM' time strings and minutes-since-midnight,
// used to position schedule blocks on the visual grid.

export const HOUR_HEIGHT_PX = 60 // each hour row is 60px tall
export const GRID_START_HOUR = 6  // grid starts at 6 AM
export const GRID_END_HOUR = 23   // grid ends at 11 PM

export function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number)
  return hours * 60 + minutes
}

// Converts a time string into a pixel offset from the top of the grid.
export function timeToTopOffset(time: string): number {
  const minutesFromGridStart = timeToMinutes(time) - GRID_START_HOUR * 60
  return (minutesFromGridStart / 60) * HOUR_HEIGHT_PX
}

// Converts a duration (start to end) into a pixel height.
export function durationToHeight(startTime: string, endTime: string): number {
  const durationMinutes = timeToMinutes(endTime) - timeToMinutes(startTime)
  return (durationMinutes / 60) * HOUR_HEIGHT_PX
}

export function todayString(): string {
  const date = new Date()
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}