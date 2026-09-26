// Purpose: Add the safe preload API to the renderer's Window type.
import type { PlannerApi } from './types'

declare global {
  interface Window {
    planner: PlannerApi
  }
}

export {}