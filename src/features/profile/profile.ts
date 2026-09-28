export interface PlannerProfile {
  name: string
  role: string
  bio: string
  primaryFocus: string
  goals: string[]
  interests: string[]
  workStyle: string
  dayStart: string
  dayEnd: string
  avatar: string
  lanes: {
    build: string
    learn: string
    create: string
    grow: string
  }
}

export const DEFAULT_PROFILE: PlannerProfile = {
  name: 'Meckiul',
  role: 'Developer & builder',
  bio: 'Building apps, games and online projects while learning new technical skills.',
  primaryFocus: 'App development',
  goals: [
    'Build and ship useful apps',
    'Keep improving my coding skills',
    'Create useful content',
    'Grow freelance and online-business work',
  ],
  interests: [
    'Web development',
    'Mobile apps',
    'Game development',
    'AI & automation',
    'Content creation',
  ],
  workStyle: 'Focused blocks with room for learning, exercise and creative work.',
  dayStart: '06:30',
  dayEnd: '22:30',
  avatar: '',
  lanes: {
    build: 'Apps, games and development projects',
    learn: 'Coding, AI and technical skills',
    create: 'Videos, reels and useful content',
    grow: 'Freelancing and online-business progress',
  },
}

const PROFILE_KEY = 'myplanner-profile'

function normalizeProfile(value: Partial<PlannerProfile> | null): PlannerProfile {
  return {
    ...DEFAULT_PROFILE,
    ...value,
    goals: Array.isArray(value?.goals) ? value.goals : DEFAULT_PROFILE.goals,
    interests: Array.isArray(value?.interests) ? value.interests : DEFAULT_PROFILE.interests,
    lanes: {
      ...DEFAULT_PROFILE.lanes,
      ...(value?.lanes ?? {}),
    },
  }
}

export function getPlannerProfile(): PlannerProfile {
  try {
    const raw = localStorage.getItem(PROFILE_KEY)
    return raw ? normalizeProfile(JSON.parse(raw)) : DEFAULT_PROFILE
  } catch {
    return DEFAULT_PROFILE
  }
}

export function savePlannerProfile(profile: PlannerProfile) {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(normalizeProfile(profile)))
}

export function resetPlannerProfile() {
  savePlannerProfile(DEFAULT_PROFILE)
  return DEFAULT_PROFILE
}
