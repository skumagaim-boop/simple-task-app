export const STORAGE_KEY = "simple-task-app.tasks";

export function loadTasks(storage) {
  try {
    const value = JSON.parse(storage.getItem(STORAGE_KEY) ?? "[]");
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

export function saveTasks(storage, tasks) {
  storage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

export function removeTask(tasks, taskId) {
  return tasks.filter((task) => task.id !== taskId);
}
