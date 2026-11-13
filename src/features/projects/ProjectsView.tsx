import { useEffect, useState, type FormEvent } from 'react'
import { FolderKanban, Plus, Trash2, CalendarDays, ArrowUpRight, CheckCircle2 } from 'lucide-react'

type Project = { id: string; name: string; area: 'Work' | 'Personal'; status: 'Planning' | 'Active' | 'On hold' | 'Completed'; progress: number; dueDate: string; description: string }
const KEY = 'myplanner-projects-v1'
function readProjects(): Project[] {
  try { const value = JSON.parse(localStorage.getItem(KEY) || '[]'); return Array.isArray(value) ? value : [] } catch { return [] }
}
export function ProjectsView() {
  const [projects, setProjects] = useState<Project[]>(readProjects)
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')
  const [area, setArea] = useState<Project['area']>('Work')
  const [dueDate, setDueDate] = useState('')
  const [description, setDescription] = useState('')
  useEffect(() => { localStorage.setItem(KEY, JSON.stringify(projects)) }, [projects])
  const active = projects.filter(p => p.status === 'Active').length
  const completed = projects.filter(p => p.status === 'Completed').length
  function addProject(event: FormEvent) {
    event.preventDefault()
    if (!name.trim()) return
    setProjects(current => [{ id: crypto.randomUUID(), name: name.trim(), area, status: 'Planning', progress: 0, dueDate, description: description.trim() }, ...current])
    setName(''); setDueDate(''); setDescription(''); setArea('Work'); setShowForm(false)
  }
  function update(id: string, patch: Partial<Project>) { setProjects(current => current.map(p => p.id === id ? { ...p, ...patch } : p)) }
  return <div className="projects-page max-w-6xl mx-auto p-5 sm:p-8 lg:p-10 space-y-6">
    <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
      <div><div className="health-eyebrow"><FolderKanban size={14}/> WORK & PERSONAL PROJECTS</div><h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900 mt-3">Move meaningful work forward.</h1><p className="text-sm text-gray-500 mt-2">Keep your builds, responsibilities and personal goals in one place.</p></div>
      <button className="health-primary" onClick={() => setShowForm(v => !v)}><Plus size={16}/>{showForm ? 'Close form' : 'New project'}</button>
    </header>
    <div className="grid sm:grid-cols-3 gap-3">
      <div className="health-metric"><p className="text-xs text-gray-500">Total projects</p><p className="text-3xl font-bold text-gray-900 mt-2">{projects.length}</p></div>
      <div className="health-metric"><p className="text-xs text-gray-500">In progress</p><p className="text-3xl font-bold text-gray-900 mt-2">{active}</p></div>
      <div className="health-metric"><p className="text-xs text-gray-500">Completed</p><p className="text-3xl font-bold text-gray-900 mt-2">{completed}</p></div>
    </div>
    {showForm && <form onSubmit={addProject} className="health-panel p-5 grid sm:grid-cols-2 gap-4">
      <label className="health-field sm:col-span-2"><span>Project name</span><input required autoFocus placeholder="e.g. Launch my portfolio" value={name} onChange={e => setName(e.target.value)}/></label>
      <label className="health-field"><span>Area</span><select value={area} onChange={e => setArea(e.target.value as Project['area'])}><option>Work</option><option>Personal</option></select></label>
      <label className="health-field"><span>Target date</span><input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)}/></label>
      <label className="health-field sm:col-span-2"><span>What does success look like?</span><textarea rows={2} placeholder="Add a short description or outcome…" value={description} onChange={e => setDescription(e.target.value)}/></label>
      <div className="sm:col-span-2 flex justify-end"><button className="health-primary" type="submit">Create project</button></div>
    </form>}
    {projects.length === 0 ? <div className="health-panel health-empty p-8"><FolderKanban size={28}/><p>No projects added yet.</p><span>Create your first project to start tracking real progress.</span><button className="health-primary mt-2" onClick={() => setShowForm(true)}><Plus size={15}/> Add a project</button></div> :
      <div className="grid lg:grid-cols-2 gap-4">{projects.map(project => <article key={project.id} className="health-panel p-5 space-y-4">
        <div className="flex items-start gap-3"><span className="health-icon"><FolderKanban size={18}/></span><div className="flex-1 min-w-0"><div className="flex flex-wrap items-center gap-2"><h2 className="font-bold text-gray-900">{project.name}</h2><span className="health-count">{project.area}</span></div><p className="text-xs text-gray-500 mt-1">{project.description || 'No description yet.'}</p></div><button className="health-delete" onClick={() => setProjects(current => current.filter(p => p.id !== project.id))} aria-label="Delete project"><Trash2 size={15}/></button></div>
        <div className="flex flex-wrap items-center justify-between gap-3"><label className="health-field flex-row items-center gap-2"><span>Status</span><select className="!w-auto !py-2" value={project.status} onChange={e => update(project.id, {status:e.target.value as Project['status'], progress:e.target.value === 'Completed' ? 100 : project.progress})}><option>Planning</option><option>Active</option><option>On hold</option><option>Completed</option></select></label>{project.dueDate && <span className="text-[11px] text-gray-400 flex items-center gap-1"><CalendarDays size={13}/>{new Date(project.dueDate+'T12:00:00').toLocaleDateString()}</span>}</div>
        <div><div className="flex justify-between text-[11px] mb-2"><span className="font-semibold text-gray-600">Progress</span><span className="text-gray-400">{project.progress}%</span></div><input aria-label={'Progress for '+project.name} className="w-full accent-emerald-600" type="range" min="0" max="100" step="5" value={project.progress} onChange={e => update(project.id, {progress:Number(e.target.value), status:Number(e.target.value) === 100 ? 'Completed' : project.status === 'Completed' ? 'Active' : project.status})}/></div>
        {project.status === 'Completed' && <p className="text-xs text-emerald-700 flex items-center gap-2"><CheckCircle2 size={14}/> Marked as completed</p>}
      </article>)}</div>}
    <p className="text-[11px] text-gray-400 text-center">Projects are stored locally on this device. Add your own milestones and update progress as work moves forward.</p>
  </div>
}
