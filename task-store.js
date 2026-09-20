export const STORAGE_KEY = 'simple-task-app.tasks';

export function validateTitle(title) {
  return title.trim() ? '' : 'タイトルを入力してください。';
}

export function createTask(title, description = '', id = crypto.randomUUID()) {
  const error = validateTitle(title);
  if (error) throw new Error(error);

  return {
    id,
    title: title.trim(),
    description: description.trim(),
    completed: false,
    createdAt: new Date().toISOString(),
  };
}

export function loadTasks(storage) {
  try {
    const value = JSON.parse(storage.getItem(STORAGE_KEY) ?? '[]');
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

export function saveTasks(storage, tasks) {
  storage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}
