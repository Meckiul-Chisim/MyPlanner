import { useEffect, useMemo, useRef, useState } from 'react'
import { Camera, Check, Clock3, Code2, Gamepad2, Globe2, ImagePlus, Pencil, Rocket, Save, Sparkles, Target, Trash2, UserRound, X, Zap } from 'lucide-react'
import {
  DEFAULT_PROFILE,
  getPlannerProfile,
  resetPlannerProfile,
  savePlannerProfile,
  type PlannerProfile,
} from './profile'

function splitLines(value: string) {
  return value.split('\n').map((item) => item.trim()).filter(Boolean)
}

function joinLines(value: string[]) {
  return value.join('\n')
}

const laneMeta = [
  { key: 'build' as const, label: 'Build', icon: Code2 },
  { key: 'learn' as const, label: 'Learn', icon: Sparkles },
  { key: 'create' as const, label: 'Create', icon: Globe2 },
  { key: 'grow' as const, label: 'Grow', icon: Rocket },
]

export function ProfileView() {
  const [profile, setProfile] = useState<PlannerProfile>(() => getPlannerProfile())
  const [editing, setEditing] = useState(false)
  const [saved, setSaved] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const sync = () => setProfile(getPlannerProfile())
    window.addEventListener('myplanner-profile-updated', sync)
    return () => window.removeEventListener('myplanner-profile-updated', sync)
  }, [])

  const initials = useMemo(() => {
    const words = profile.name.trim().split(/\s+/).filter(Boolean)
    return (words.length > 1 ? words.slice(0, 2).map((word) => word[0]).join('') : profile.name.slice(0, 2)).toUpperCase() || 'M'
  }, [profile.name])

  function update<K extends keyof PlannerProfile>(key: K, value: PlannerProfile[K]) {
    setProfile((current) => ({ ...current, [key]: value }))
    setSaved(false)
  }

  function handleAvatar(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) return
    if (file.size > 3 * 1024 * 1024) {
      window.alert('Please choose an image smaller than 3 MB.')
      return
    }

    const reader = new FileReader()
    reader.onload = () => update('avatar', String(reader.result || ''))
    reader.readAsDataURL(file)
    event.target.value = ''
  }

  function save() {
    savePlannerProfile(profile)
    window.dispatchEvent(new Event('myplanner-profile-updated'))
    setSaved(true)
    setEditing(false)
    window.setTimeout(() => setSaved(false), 2200)
  }

  function restore() {
    setProfile(resetPlannerProfile())
    window.dispatchEvent(new Event('myplanner-profile-updated'))
    setSaved(true)
    setEditing(false)
    window.setTimeout(() => setSaved(false), 2200)
  }

  return (
    <div className="profile-page max-w-5xl mx-auto p-5 sm:p-8 lg:p-10 space-y-6">
      <section className="profile-hero bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="profile-hero-cover" />
        <div className="px-5 sm:px-8 pb-7">
          <div className="flex flex-col sm:flex-row sm:items-end gap-5 -mt-12 relative">
            <div className="profile-avatar-wrap">
              {profile.avatar ? (
                <img src={profile.avatar} alt={profile.name || 'Profile'} className="profile-avatar" />
              ) : (
                <div className="profile-avatar profile-avatar-fallback">{initials}</div>
              )}
              {editing && (
                <>
                  <button type="button" onClick={() => fileRef.current?.click()} className="profile-avatar-edit" aria-label="Change profile picture">
                    <Camera size={15} />
                  </button>
                  <input ref={fileRef} type="file" accept="image/*" onChange={handleAvatar} className="hidden" />
                </>
              )}
            </div>

            <div className="flex-1 min-w-0 pb-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">{profile.name || 'Your profile'}</h1>
                <span className="profile-status"><Check size={12} /> Local profile</span>
              </div>
              <p className="text-sm font-medium text-primary-700 mt-1">{profile.role || 'Developer & builder'}</p>
              <p className="text-sm text-gray-500 mt-2 max-w-2xl">{profile.bio || 'Tell MyPlanner a little about yourself.'}</p>
            </div>

            <div className="flex items-center gap-2 pb-1">
              {editing ? (
                <>
                  <button onClick={() => setEditing(false)} className="profile-secondary-button"><X size={14} /> Cancel</button>
                  <button onClick={save} className="profile-primary-button"><Save size={14} /> {saved ? 'Saved' : 'Save'}</button>
                </>
              ) : (
                <button onClick={() => setEditing(true)} className="profile-primary-button"><Pencil size={14} /> Edit profile</button>
              )}
            </div>
          </div>
        </div>
      </section>

      {editing ? (
        <ProfileEditor profile={profile} update={update} onRestore={restore} />
      ) : (
        <>
          <div className="grid lg:grid-cols-3 gap-4">
            <InfoCard icon={<Target size={18} />} label="Primary focus" value={profile.primaryFocus || 'Not set'} />
            <InfoCard icon={<Clock3 size={18} />} label="Daily window" value={profile.dayStart + ' – ' + profile.dayEnd} />
            <InfoCard icon={<Zap size={18} />} label="Work style" value={profile.workStyle || 'Not set'} />
          </div>

          <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6">
            <SectionHeading icon={<Target size={17} />} title="Current goals" subtitle="What you are actively moving forward." />
            <div className="grid sm:grid-cols-2 gap-3 mt-5">
              {profile.goals.length ? profile.goals.map((goal) => (
                <div key={goal} className="profile-list-card"><Check size={15} /> <span>{goal}</span></div>
              )) : <EmptyState text="No goals added yet." />}
            </div>
          </section>

          <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6">
            <SectionHeading icon={<Sparkles size={17} />} title="Interests" subtitle="Topics that shape your learning and projects." />
            <div className="flex flex-wrap gap-2 mt-5">
              {profile.interests.length ? profile.interests.map((interest) => <span key={interest} className="profile-chip">{interest}</span>) : <EmptyState text="No interests added yet." />}
            </div>
          </section>

          <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6">
            <SectionHeading icon={<Rocket size={17} />} title="Your planner lanes" subtitle="The four areas MyPlanner uses to organize your bigger picture." />
            <div className="grid sm:grid-cols-2 gap-3 mt-5">
              {laneMeta.map(({ key, label, icon: Icon }) => (
                <div key={key} className="profile-lane-card">
                  <span className="profile-lane-icon"><Icon size={17} /></span>
                  <div><p className="text-sm font-bold text-gray-800">{label}</p><p className="text-xs text-gray-500 mt-1">{profile.lanes[key]}</p></div>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6">
            <SectionHeading icon={<Gamepad2 size={17} />} title="About your workspace" subtitle="A quick snapshot of how you use MyPlanner." />
            <div className="mt-5 rounded-2xl bg-primary-50 border border-primary-100 p-5">
              <p className="text-sm font-semibold text-primary-800">{profile.primaryFocus || 'Build what matters'}</p>
              <p className="text-sm text-primary-700/75 mt-2 leading-relaxed">{profile.bio}</p>
              <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-primary-700"><UserRound size={14} /> {profile.role}</div>
            </div>
          </section>
        </>
      )}
    </div>
  )
}

function ProfileEditor({ profile, update, onRestore }: {
  profile: PlannerProfile
  update: <K extends keyof PlannerProfile>(key: K, value: PlannerProfile[K]) => void
  onRestore: () => void
}) {
  return (
    <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6">
      <div className="flex items-center justify-between gap-3 mb-5">
        <div><h2 className="text-sm font-bold text-gray-800">Edit your profile</h2><p className="text-xs text-gray-400 mt-1">Your profile is stored locally on this device.</p></div>
        <button type="button" onClick={onRestore} className="profile-secondary-button"><Trash2 size={14} /> Restore starter</button>
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <ProfileField label="Name" value={profile.name} onChange={(v) => update('name', v)} />
        <ProfileField label="Role" value={profile.role} onChange={(v) => update('role', v)} />
        <ProfileField label="Primary focus" value={profile.primaryFocus} onChange={(v) => update('primaryFocus', v)} />
        <div className="grid grid-cols-2 gap-3">
          <ProfileField label="Starts" type="time" value={profile.dayStart} onChange={(v) => update('dayStart', v)} />
          <ProfileField label="Ends" type="time" value={profile.dayEnd} onChange={(v) => update('dayEnd', v)} />
        </div>
        <ProfileTextarea label="About you" value={profile.bio} onChange={(v) => update('bio', v)} />
        <ProfileTextarea label="Work style" value={profile.workStyle} onChange={(v) => update('workStyle', v)} />
        <ProfileTextarea label="Goals" hint="One per line" value={joinLines(profile.goals)} onChange={(v) => update('goals', splitLines(v))} />
        <ProfileTextarea label="Interests" hint="One per line" value={joinLines(profile.interests)} onChange={(v) => update('interests', splitLines(v))} />
      </div>
      <div className="mt-5">
        <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-3">Planner lanes</p>
        <div className="grid sm:grid-cols-2 gap-3">
          {laneMeta.map(({ key, label }) => <ProfileField key={key} label={label} value={profile.lanes[key]} onChange={(v) => update('lanes', { ...profile.lanes, [key]: v })} />)}
        </div>
      </div>
      <p className="text-xs text-gray-400 mt-5 flex items-center gap-2"><ImagePlus size={13} /> Profile pictures are kept locally and are not uploaded anywhere.</p>
    </section>
  )
}

function ProfileField({ label, value, onChange, type = 'text' }: { label: string; value: string; onChange: (value: string) => void; type?: string }) {
  return <label className="profile-field block"><span className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">{label}</span><input type={type} value={value} onChange={(e) => onChange(e.target.value)} className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-700 outline-none" /></label>
}

function ProfileTextarea({ label, value, onChange, hint }: { label: string; value: string; onChange: (value: string) => void; hint?: string }) {
  return <label className="profile-field block"><span className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">{label}{hint && <span className="normal-case tracking-normal font-medium opacity-70">· {hint}</span>}</span><textarea value={value} onChange={(e) => onChange(e.target.value)} rows={3} className="w-full resize-y rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-700 outline-none" /></label>
}

function InfoCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 profile-info-card"><span className="profile-info-icon">{icon}</span><p className="text-[10px] uppercase tracking-wider font-bold text-gray-400 mt-4">{label}</p><p className="text-sm font-semibold text-gray-800 mt-1">{value}</p></div>
}

function SectionHeading({ icon, title, subtitle }: { icon: React.ReactNode; title: string; subtitle: string }) {
  return <div className="flex items-center gap-3"><span className="profile-section-icon">{icon}</span><div><h2 className="text-sm font-bold text-gray-800">{title}</h2><p className="text-xs text-gray-400 mt-0.5">{subtitle}</p></div></div>
}

function EmptyState({ text }: { text: string }) {
  return <p className="text-xs text-gray-400">{text}</p>
}
