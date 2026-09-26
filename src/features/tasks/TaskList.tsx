import { useEffect, useState } from 'react'
import { ClipboardList } from 'lucide-react'
import type { NewTask, Task } from '../../db/types'
import { TaskForm } from './TaskForm'
import { TaskItem } from './TaskItem'
import { EmptyState } from '../../components/EmptyState'

export function TaskList() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)

  async function refreshTasks() {
    const data = await window.planner.getTasks()
    setTasks(data)
  }

  useEffect(() => {
    refreshTasks().finally(() => setLoading(false))
  }, [])

  async function handleAdd(task: NewTask) {
    await window.planner.addTask(task)
    await refreshTasks()
  }

  async function handleToggle(id: number) {
    await window.planner.toggleTask(id)
    await refreshTasks()
  }

  async function handleDelete(id: number) {
    await window.planner.deleteTask(id)
    await refreshTasks()
  }

  if (loading) {
    return <p className="text-sm text-gray-400 p-4">Loading tasks…</p>
  }

  return (
    <div className="max-w-2xl mx-auto p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-800 tracking-tight">Tasks</h1>
        <p className="text-sm text-gray-400 mt-1">Keep track of what needs doing.</p>
      </div>

      <TaskForm onAdd={handleAdd} />

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200">
        {tasks.length === 0 ? (
          <EmptyState icon={ClipboardList} message="No tasks yet — add one above." />
        ) : (
          tasks.map((task) => (
            <TaskItem key={task.id} task={task} onToggle={handleToggle} onDelete={handleDelete} />
          ))
        )}
      </div>
    </div>
  )
}