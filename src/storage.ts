export type Task = { id: string; title: string; completed: boolean; createdAt: number }

const KEY = 'taskly.tasks'

const isTask = (value: unknown): value is Task => {
  if (typeof value !== 'object' || value === null) return false
  const task = value as Partial<Task>
  return typeof task.id === 'string'
    && typeof task.title === 'string'
    && typeof task.completed === 'boolean'
    && typeof task.createdAt === 'number'
}

export const taskStorage = {
  async load(): Promise<Task[]> {
    const value = localStorage.getItem(KEY)
    if (!value) return []
    const tasks: unknown = JSON.parse(value)
    if (!Array.isArray(tasks) || !tasks.every(isTask)) throw new Error('Invalid task data')
    return tasks
  },
  async save(tasks: Task[]) {
    localStorage.setItem(KEY, JSON.stringify(tasks))
  },
}
