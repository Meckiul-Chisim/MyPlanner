// Purpose: A consistent "nothing here yet" state — an icon plus a short
// message — used across Tasks, Habits, Schedule, and Dashboard so empty
// screens feel intentional rather than like something's missing.
import type { LucideIcon } from 'lucide-react'

interface EmptyStateProps {
  icon: LucideIcon
  message: string
}

export function EmptyState({ icon: Icon, message }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-14 text-center">
      <Icon size={32} strokeWidth={1.5} className="text-gray-300" />
      <p className="text-sm text-gray-400">{message}</p>
    </div>
  )
}