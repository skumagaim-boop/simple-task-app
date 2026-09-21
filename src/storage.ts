export type Task = { id: string; title: string; completed: boolean; createdAt: number }

const KEY = 'taskly.tasks'

export const taskStorage = {
  async load(): Promise<Task[]> {
    const value = localStorage.getItem(KEY)
    if (!value) return []
    const tasks: unknown = JSON.parse(value)
    if (!Array.isArray(tasks)) throw new Error('Invalid task data')
    return tasks as Task[]
  },
  async save(tasks: Task[]) {
    localStorage.setItem(KEY, JSON.stringify(tasks))
  },
}
