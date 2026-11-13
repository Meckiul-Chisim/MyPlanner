import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from 'react'
import { Activity, Droplets, Moon, Scale, Plus, Dumbbell, HeartPulse, Check, Trash2, TrendingUp } from 'lucide-react'

type Mood = 'low' | 'okay' | 'good' | 'great'
type DailyLog = { date: string; water: number; sleep: number; weight: number | null; mood: Mood }
type Workout = { id: string; date: string; type: string; minutes: number; notes: string }
type HealthState = { daily: DailyLog[]; workouts: Workout[]; waterGoal: number; sleepGoal: number }

const KEY = 'myplanner-health-v1'
const today = () => {
  const d = new Date()
  return [d.getFullYear(), String(d.getMonth() + 1).padStart(2, '0'), String(d.getDate()).padStart(2, '0')].join('-')
}
const blank: HealthState = { daily: [], workouts: [], waterGoal: 8, sleepGoal: 8 }
function readHealth(): HealthState {
  try {
    const value = JSON.parse(localStorage.getItem(KEY) || 'null') as Partial<HealthState> | null
    return { daily: Array.isArray(value?.daily) ? value!.daily! : [], workouts: Array.isArray(value?.workouts) ? value!.workouts! : [], waterGoal: Number(value?.waterGoal) > 0 ? Number(value?.waterGoal) : 8, sleepGoal: Number(value?.sleepGoal) > 0 ? Number(value?.sleepGoal) : 8 }
  } catch { return blank }
}
function prettyDate(date: string) { return new Date(date + 'T12:00:00').toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' }) }

export function HealthView() {
  const [data, setData] = useState<HealthState>(readHealth)
  const [water, setWater] = useState('0')
  const [sleep, setSleep] = useState('8')
  const [weight, setWeight] = useState('')
  const [mood, setMood] = useState<Mood>('good')
  const [workoutType, setWorkoutType] = useState('Strength')
  const [minutes, setMinutes] = useState('30')
  const [notes, setNotes] = useState('')
  const [saved, setSaved] = useState(false)
  const date = today()
  const todayLog = data.daily.find(item => item.date === date)

  useEffect(() => {
    if (todayLog) {
      setWater(String(todayLog.water)); setSleep(String(todayLog.sleep))
      setWeight(todayLog.weight == null ? '' : String(todayLog.weight)); setMood(todayLog.mood)
    }
  }, [todayLog?.date])

  useEffect(() => { localStorage.setItem(KEY, JSON.stringify(data)) }, [data])

  const week = useMemo(() => {
    return Array.from({ length: 7 }, (_, index) => {
      const d = new Date(); d.setDate(d.getDate() - (6 - index))
      const key = [d.getFullYear(), String(d.getMonth() + 1).padStart(2, '0'), String(d.getDate()).padStart(2, '0')].join('-')
      return data.daily.find(item => item.date === key)
    })
  }, [data.daily])
  const workoutsThisWeek = data.workouts.filter(w => {
    const d = new Date(w.date + 'T12:00:00'); const start = new Date(); start.setDate(start.getDate() - 6); start.setHours(0,0,0,0)
    return d >= start && d <= new Date(date + 'T23:59:59')
  })
  const minutesThisWeek = workoutsThisWeek.reduce((sum, item) => sum + item.minutes, 0)
  const waterPct = Math.min(100, Math.round((Number(water) / data.waterGoal) * 100))
  const sleepPct = Math.min(100, Math.round((Number(sleep) / data.sleepGoal) * 100))

  function saveCheckIn(event: FormEvent) {
    event.preventDefault()
    const entry: DailyLog = { date, water: Math.max(0, Number(water) || 0), sleep: Math.max(0, Number(sleep) || 0), weight: weight.trim() ? Number(weight) : null, mood }
    setData(current => ({ ...current, daily: [...current.daily.filter(item => item.date !== date), entry].sort((a,b) => a.date.localeCompare(b.date)) }))
    setSaved(true); window.setTimeout(() => setSaved(false), 1800)
  }
  function addWorkout(event: FormEvent) {
    event.preventDefault()
    const duration = Number(minutes)
    if (!workoutType.trim() || !Number.isFinite(duration) || duration <= 0) return
    setData(current => ({ ...current, workouts: [{ id: crypto.randomUUID(), date, type: workoutType.trim(), minutes: duration, notes: notes.trim() }, ...current.workouts] }))
    setNotes('')
  }
  function removeWorkout(id: string) { setData(current => ({ ...current, workouts: current.workouts.filter(item => item.id !== id) })) }

  return (
    <div className="health-page max-w-6xl mx-auto p-5 sm:p-8 lg:p-10 space-y-7">
      <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div><div className="health-eyebrow"><HeartPulse size={14}/> HEALTH & FITNESS</div><h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900 mt-3">Take care of your energy.</h1><p className="text-sm text-gray-500 mt-2">Track the basics, notice patterns, and build consistency without pressure.</p></div>
        <div className="health-date">{prettyDate(date)}</div>
      </header>

      <section className="grid sm:grid-cols-2 xl:grid-cols-4 gap-3">
        <Metric icon={<Dumbbell size={18}/>} label="Workouts this week" value={String(workoutsThisWeek.length)} detail={minutesThisWeek + ' active minutes'} tone="mint"/>
        <Metric icon={<Droplets size={18}/>} label="Water today" value={water + ' / ' + data.waterGoal} detail="glasses logged" tone="blue"/>
        <Metric icon={<Moon size={18}/>} label="Sleep last night" value={(todayLog?.sleep ?? 0) + 'h'} detail={'Target ' + data.sleepGoal + ' hours'} tone="violet"/>
        <Metric icon={<Scale size={18}/>} label="Latest weight" value={(data.daily.filter(x => x.weight != null).at(-1)?.weight != null ? data.daily.filter(x => x.weight != null).at(-1)!.weight!.toFixed(1) + ' kg' : '—')} detail="Only recorded when you choose" tone="sand"/>
      </section>

      <section className="grid xl:grid-cols-[1.15fr_.85fr] gap-5">
        <form onSubmit={saveCheckIn} className="health-panel p-5 sm:p-6 space-y-5">
          <div className="flex items-center justify-between"><div><h2 className="text-lg font-bold text-gray-900">Daily check-in</h2><p className="text-xs text-gray-500 mt-1">Your entries are saved on this device.</p></div><span className="health-icon"><Activity size={18}/></span></div>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Water intake" suffix="glasses"><input type="number" min="0" max="50" value={water} onChange={e => setWater(e.target.value)} /></Field>
            <Field label="Sleep" suffix="hours"><input type="number" min="0" max="24" step=".25" value={sleep} onChange={e => setSleep(e.target.value)} /></Field>
            <Field label="Body weight" suffix="kg (optional)"><input type="number" min="0" max="500" step=".1" placeholder="e.g. 52.5" value={weight} onChange={e => setWeight(e.target.value)} /></Field>
            <label className="health-field"><span>How are you feeling?</span><select value={mood} onChange={e => setMood(e.target.value as Mood)}><option value="low">Low energy</option><option value="okay">Okay</option><option value="good">Good</option><option value="great">Great</option></select></label>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <Progress label="Hydration goal" value={waterPct} display={water + ' / ' + data.waterGoal + ' glasses'} />
            <Progress label="Sleep goal" value={sleepPct} display={sleep + ' / ' + data.sleepGoal + ' hours'} />
          </div>
          <div className="flex items-center justify-between gap-3"><p className="text-[11px] text-gray-400">Set realistic goals in Settings later. These are starting targets, not medical advice.</p><button className="health-primary" type="submit">{saved ? <><Check size={15}/> Saved</> : 'Save check-in'}</button></div>
        </form>

        <div className="health-panel p-5 sm:p-6 space-y-5">
          <div><h2 className="text-lg font-bold text-gray-900">Weekly consistency</h2><p className="text-xs text-gray-500 mt-1">Based only on check-ins you have recorded.</p></div>
          <div className="flex items-end justify-between gap-2 h-36 pt-3">
            {week.map((entry, index) => { const d = new Date(); d.setDate(d.getDate() - (6 - index)); return <div key={index} className="flex-1 h-full flex flex-col justify-end items-center gap-2"><div className="w-full max-w-9 rounded-t-lg bg-gray-100 overflow-hidden flex items-end h-24"><div className="w-full rounded-t-lg bg-gradient-to-t from-emerald-600 to-emerald-400 transition-all duration-700" style={{height: entry ? Math.max(12, Math.min(100, (entry.water / data.waterGoal) * 100)) + '%' : '0%'}}/></div><span className="text-[10px] text-gray-400">{d.toLocaleDateString(undefined, {weekday:'narrow'})}</span></div>})}
          </div>
          <div className="health-insight"><TrendingUp size={16}/><p>{week.filter(Boolean).length} of 7 days checked in. Consistency matters more than a perfect streak.</p></div>
          <div className="border-t border-gray-100 pt-4 grid grid-cols-2 gap-3">
            <label className="health-setting"><span>Daily water goal</span><input type="number" min="1" max="30" value={data.waterGoal} onChange={e => setData(x => ({...x, waterGoal: Math.max(1, Number(e.target.value) || 1)}))}/></label>
            <label className="health-setting"><span>Sleep goal (hours)</span><input type="number" min="1" max="16" step=".5" value={data.sleepGoal} onChange={e => setData(x => ({...x, sleepGoal: Math.max(1, Number(e.target.value) || 1)}))}/></label>
          </div>
        </div>
      </section>

      <section className="grid xl:grid-cols-[.8fr_1.2fr] gap-5">
        <form onSubmit={addWorkout} className="health-panel p-5 sm:p-6 space-y-4">
          <div><h2 className="text-lg font-bold text-gray-900">Log a workout</h2><p className="text-xs text-gray-500 mt-1">Record strength, walking, mobility or any activity.</p></div>
          <label className="health-field"><span>Activity</span><select value={workoutType} onChange={e => setWorkoutType(e.target.value)}><option>Strength</option><option>Walking</option><option>Running</option><option>Cycling</option><option>Mobility</option><option>Sports</option><option>Other</option></select></label>
          <Field label="Duration" suffix="minutes"><input type="number" min="1" max="600" value={minutes} onChange={e => setMinutes(e.target.value)}/></Field>
          <label className="health-field"><span>Notes (optional)</span><textarea rows={2} placeholder="What did you work on?" value={notes} onChange={e => setNotes(e.target.value)}/></label>
          <button className="health-primary w-full" type="submit"><Plus size={16}/> Add workout</button>
        </form>
        <div className="health-panel p-5 sm:p-6">
          <div className="flex items-center justify-between mb-4"><div><h2 className="text-lg font-bold text-gray-900">Activity history</h2><p className="text-xs text-gray-500 mt-1">Your actual workout log.</p></div><span className="health-count">{data.workouts.length} total</span></div>
          {data.workouts.length === 0 ? <div className="health-empty"><Dumbbell size={22}/><p>No workouts recorded yet.</p><span>Your first entry will appear here.</span></div> : <div className="space-y-2 max-h-80 overflow-y-auto">{data.workouts.slice(0,20).map(item => <div key={item.id} className="health-workout"><span className="health-workout-icon"><Activity size={16}/></span><div className="min-w-0 flex-1"><p className="text-sm font-semibold text-gray-800">{item.type} <span className="text-gray-400 font-normal">· {item.minutes} min</span></p><p className="text-[11px] text-gray-400 mt-1">{prettyDate(item.date)}{item.notes ? ' · ' + item.notes : ''}</p></div><button type="button" className="health-delete" onClick={() => removeWorkout(item.id)} aria-label="Delete workout"><Trash2 size={15}/></button></div>)}</div>}
        </div>
      </section>
      <p className="text-[11px] text-gray-400 text-center">MyPlanner is a personal tracking tool, not a medical device. You control what you record and can delete entries at any time.</p>
    </div>
  )
}

function Metric({icon,label,value,detail,tone}:{icon:ReactNode;label:string;value:string;detail:string;tone:string}) {
  return <div className="health-metric"><span className={'health-metric-icon '+tone}>{icon}</span><p className="text-xs text-gray-500 mt-4">{label}</p><p className="text-2xl font-bold text-gray-900 mt-1">{value}</p><p className="text-[11px] text-gray-400 mt-1">{detail}</p></div>
}
function Field({label,suffix,children}:{label:string;suffix:string;children:ReactNode}) {
  return <label className="health-field"><span>{label} <small>{suffix}</small></span>{children}</label>
}
function Progress({label,value,display}:{label:string;value:number;display:string}) {
  return <div><div className="flex justify-between text-[11px] mb-2"><span className="font-semibold text-gray-600">{label}</span><span className="text-gray-400">{display}</span></div><div className="h-2 rounded-full bg-gray-100 overflow-hidden"><div className="h-full rounded-full bg-emerald-500 transition-all duration-700" style={{width:value+'%'}}/></div></div>
}
