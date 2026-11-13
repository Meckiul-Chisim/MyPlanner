# MyPlanner

MyPlanner is a private-by-default personal workspace for managing **work, life and health** in one place. The current desktop application is built with Electron, React, TypeScript and Vite.

## Product areas

- **Today** — an at-a-glance view of tasks, habits and the day's schedule.
- **Tasks** — capture actions, set priorities and due dates, and track completion.
- **Projects** — organize work and personal projects, set target dates, update status and track progress.
- **Habits** — build routines and review daily completion streaks.
- **Schedule** — time-block your day and receive desktop reminders.
- **Health** — record workouts, hydration, sleep, mood and optional body-weight check-ins. Weekly views are calculated from your own entries.
- **Profile & settings** — personalize your workspace and preferences.

## Technology

- Electron + electron-vite
- React 19 + TypeScript
- Tailwind CSS 4 + Lucide icons
- Local SQLite database for tasks, habits and schedule data
- Local device storage for profile preferences, projects and health logs

No account, paid API or external database is required for the current local-first desktop workflow. Health and project entries are not sent to a server.

## Development

Requirements: Node.js (current LTS recommended) and npm.

```bash
npm install
npm run dev
```

## Build a Windows installer

```bash
npm run build
npm run dist
```

The installer is written to the `release/` directory.

## Data & privacy

The app stores its working data locally on the device. Keep regular backups of important information. The current project and health modules use browser storage within the Electron app profile; they do not yet sync with a phone or another computer.

## Product direction

The long-term direction is a connected personal operating system across desktop and mobile, with optional secure sync and export/restore. Mobile sync should be added only after a deliberate account, encryption, backup and conflict-resolution design—not by silently uploading personal health information.
