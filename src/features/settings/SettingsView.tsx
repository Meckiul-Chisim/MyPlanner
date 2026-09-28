import { useEffect, useState, type ReactNode } from 'react'
import { Check, Database, Moon, Palette, RotateCcw, Save, Sparkles, Sun, UserRound, Zap } from 'lucide-react'
import {
  DEFAULT_PROFILE,
  getPlannerProfile,
  resetPlannerProfile,
  savePlannerProfile,
  type PlannerProfile,
} from '../profile/profile'

type Theme = 'sage' | 'lavender' | 'ocean' | 'rose' | 'midnight'
type Motion = 'full' | 'reduced'

const THEME_KEY = 'myplanner-theme'
const MOTION_KEY = 'myplanner-motion'

function splitLines(value: string) {
  return value.split('\n').map((item) => item.trim()).filter(Boolean)
}

function joinLines(value: string[]) {
  return value.join('\n')
}

export function SettingsView() {
  const [theme, setTheme] = useState<Theme>(() => (localStorage.getItem(THEME_KEY) as Theme) || 'sage')
  const [motion, setMotion] = useState<Motion>(() => (localStorage.getItem(MOTION_KEY) as Motion) || 'full')
  const [profile, setProfile] = useState<PlannerProfile>(() => getPlannerProfile())
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    localStorage.setItem(THEME_KEY, theme)
  }, [theme])

  useEffect(() => {
    document.documentElement.dataset.motion = motion
    localStorage.setItem(MOTION_KEY, motion)
  }, [motion])

  function updateProfile<K extends keyof PlannerProfile>(key: K, value: PlannerProfile[K]) {
    setProfile((current) => ({ ...current, [key]: value }))
    setSaved(false)
  }

  function saveProfile() {
    savePlannerProfile(profile)
    window.dispatchEvent(new Event('myplanner-profile-updated'))
    setSaved(true)
    window.setTimeout(() => setSaved(false), 2200)
  }

  function resetProfile() {
    const next = resetPlannerProfile()
    setProfile(next)
    window.dispatchEvent(new Event('myplanner-profile-updated'))
    setSaved(true)
    window.setTimeout(() => setSaved(false), 2200)
  }

  function resetPreferences() {
    setTheme('sage')
    setMotion('full')
  }

  return (
    <div className="max-w-4xl mx-auto p-5 sm:p-8 lg:p-10 space-y-7">
      <header>
        <div className="inline-flex items-center gap-2 rounded-full bg-primary-50 border border-primary-100 px-3 py-1.5 text-[11px] font-semibold text-primary-700 mb-3">
          <Sparkles size={13} />
          Personal workspace
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Settings</h1>
        <p className="text-sm text-gray-400 mt-2">Shape MyPlanner around your real life, goals and working style.</p>
      </header>

      <section className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden card-lift">
        <div className="px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <span className="w-9 h-9 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center"><UserRound size={17} /></span>
            <div>
              <h2 className="text-sm font-bold text-gray-800">Your profile</h2>
              <p className="text-[11px] text-gray-400">These details personalize your dashboard. Everything is editable and stored locally.</p>
            </div>
          </div>
        </div>

        <div className="p-4 space-y-5">
          <div className="grid sm:grid-cols-2 gap-3">
            <ProfileField label="Name" value={profile.name} onChange={(value) => updateProfile('name', value)} placeholder="What should MyPlanner call you?" />
            <ProfileField label="Role" value={profile.role} onChange={(value) => updateProfile('role', value)} placeholder="e.g. Developer & builder" />
            <ProfileField label="Primary focus" value={profile.primaryFocus} onChange={(value) => updateProfile('primaryFocus', value)} placeholder="What matters most right now?" />
            <div className="grid grid-cols-2 gap-3">
              <ProfileField label="Day starts" type="time" value={profile.dayStart} onChange={(value) => updateProfile('dayStart', value)} />
              <ProfileField label="Day ends" type="time" value={profile.dayEnd} onChange={(value) => updateProfile('dayEnd', value)} />
            </div>
          </div>

          <ProfileTextarea
            label="About you"
            value={profile.bio}
            onChange={(value) => updateProfile('bio', value)}
            placeholder="A short description of what you are working toward."
          />

          <ProfileTextarea
            label="Work style"
            value={profile.workStyle}
            onChange={(value) => updateProfile('workStyle', value)}
            placeholder="How do you like your day to feel?"
          />

          <div className="grid sm:grid-cols-2 gap-3">
            <ProfileTextarea
              label="Current goals"
              hint="One goal per line"
              value={joinLines(profile.goals)}
              onChange={(value) => updateProfile('goals', splitLines(value))}
              placeholder="Ship my next app\nLearn a new skill"
            />
            <ProfileTextarea
              label="Interests"
              hint="One interest per line"
              value={joinLines(profile.interests)}
              onChange={(value) => updateProfile('interests', splitLines(value))}
              placeholder="Web development\nGame development"
            />
          </div>

          <div>
            <div className="mb-3">
              <p className="text-sm font-bold text-gray-800">Your four planner lanes</p>
              <p className="text-[11px] text-gray-400 mt-1">Rename or rewrite what each area means to you.</p>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              {(['build', 'learn', 'create', 'grow'] as const).map((lane) => (
                <ProfileField
                  key={lane}
                  label={lane.charAt(0).toUpperCase() + lane.slice(1)}
                  value={profile.lanes[lane]}
                  onChange={(value) => {
                    setProfile((current) => ({
                      ...current,
                      lanes: { ...current.lanes, [lane]: value },
                    }))
                    setSaved(false)
                  }}
                />
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-1">
            <button onClick={saveProfile} className="profile-save-button inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold">
              <Save size={14} />
              {saved ? 'Profile saved' : 'Save profile'}
            </button>
            <button onClick={resetProfile} className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-xs font-semibold text-gray-600">
              <RotateCcw size={14} />
              Restore starter profile
            </button>
          </div>
        </div>
      </section>

      <section className="settings-section bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden card-lift">
        <div className="px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <span className="w-9 h-9 rounded-xl bg-lavender-100 text-lavender-700 flex items-center justify-center"><Palette size={17} /></span>
            <div><h2 className="text-sm font-bold text-gray-800">Appearance</h2><p className="text-[11px] text-gray-400">Keep the interface calm and easy on the eyes.</p></div>
          </div>
        </div>

        <div className="p-4 space-y-3">
          <div className="grid sm:grid-cols-2 gap-3">
            <ThemeCard theme={theme} selected="sage" onSelect={setTheme} icon={<Sun size={18} />} title="Sage" description="Calm, soft and focused." />
            <ThemeCard theme={theme} selected="lavender" onSelect={setTheme} icon={<Sparkles size={18} />} title="Lavender" description="Creative and gentle." />
            <ThemeCard theme={theme} selected="ocean" onSelect={setTheme} icon={<Zap size={18} />} title="Ocean" description="Cool and refreshing." />
            <ThemeCard theme={theme} selected="rose" onSelect={setTheme} icon={<Palette size={18} />} title="Rose" description="Warm and expressive." />
            <ThemeCard theme={theme} selected="midnight" onSelect={setTheme} icon={<Moon size={18} />} title="Midnight" description="Dark and easy on the eyes." />
          </div>

          <div className="settings-control flex items-center justify-between gap-4 rounded-2xl bg-gray-50 border border-gray-100 p-4 card-lift">
            <div className="flex items-center gap-3">
              <Zap size={17} className="text-primary-600" />
              <div><p className="text-sm font-semibold text-gray-700">Animations</p><p className="text-xs text-gray-400">Ambient motion and page transitions.</p></div>
            </div>
            <select value={motion} onChange={(e) => setMotion(e.target.value as Motion)} className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-600">
              <option value="full">On</option>
              <option value="reduced">Reduced</option>
            </select>
          </div>
        </div>
      </section>

      <section className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <span className="w-9 h-9 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center"><Database size={17} /></span>
            <div><h2 className="text-sm font-bold text-gray-800">Planner data</h2><p className="text-[11px] text-gray-400">Your current setup stays on this device.</p></div>
          </div>
        </div>
        <div className="p-4">
          <div className="rounded-2xl bg-primary-50 border border-primary-100 p-4">
            <p className="text-sm font-semibold text-primary-800">Local-first workspace</p>
            <p className="text-xs text-primary-700/70 mt-1 leading-relaxed">Tasks, habits, schedule and your profile are stored locally through MyPlanner's existing storage layer. No account is required.</p>
          </div>
        </div>
      </section>

      <button onClick={resetPreferences} className="settings-reset inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-xs font-semibold text-gray-600">
        <RotateCcw size={14} />
        Reset appearance preferences
      </button>
    </div>
  )
}

function ProfileField({ label, value, onChange, placeholder, type = 'text' }: {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  type?: string
}) {
  return (
    <label className="profile-field block">
      <span className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-700 outline-none transition focus:border-primary-300 focus:ring-2 focus:ring-primary-100"
      />
    </label>
  )
}

function ProfileTextarea({ label, value, onChange, placeholder, hint }: {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  hint?: string
}) {
  return (
    <label className="profile-field block">
      <span className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">
        {label}
        {hint && <span className="normal-case tracking-normal font-medium opacity-70">· {hint}</span>}
      </span>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        rows={3}
        className="w-full resize-y rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-700 outline-none transition focus:border-primary-300 focus:ring-2 focus:ring-primary-100"
      />
    </label>
  )
}

function ThemeCard({ theme, selected, onSelect, icon, title, description }: {
  theme: Theme
  selected: Theme
  onSelect: (theme: Theme) => void
  icon: ReactNode
  title: string
  description: string
}) {
  return (
    <button
      onClick={() => onSelect(selected)}
      className={`theme-card rounded-2xl border p-4 text-left ${theme === selected ? 'theme-card-selected' : 'theme-card-idle'}`}
    >
      <div className="flex items-center justify-between">
        <span className="theme-card-icon">{icon}</span>
        {theme === selected && <Check size={15} className="text-primary-600" />}
      </div>
      <div className="theme-preview mt-3 rounded-xl h-12 border border-black/5 overflow-hidden">
        <span /><span /><span />
      </div>
      <p className="theme-card-title text-sm font-bold mt-3">{title}</p>
      <p className="theme-card-description text-xs mt-1">{description}</p>
    </button>
  )
}
