import { useEffect, useState, type ReactNode } from 'react'
import { Check, Database, Moon, Palette, RotateCcw, Sparkles, Sun, Zap } from 'lucide-react'
type Theme = 'sage' | 'lavender' | 'ocean' | 'rose' | 'midnight'
type Motion = 'full' | 'reduced'

const THEME_KEY = 'myplanner-theme'
const MOTION_KEY = 'myplanner-motion'

export function SettingsView() {
  const [theme, setTheme] = useState<Theme>(() => (localStorage.getItem(THEME_KEY) as Theme) || 'sage')
  const [motion, setMotion] = useState<Motion>(() => (localStorage.getItem(MOTION_KEY) as Motion) || 'full')

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    localStorage.setItem(THEME_KEY, theme)
  }, [theme])

  useEffect(() => {
    document.documentElement.dataset.motion = motion
    localStorage.setItem(MOTION_KEY, motion)
  }, [motion])

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
