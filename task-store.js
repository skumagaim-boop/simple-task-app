export const STORAGE_KEY = "taskly.tasks";

export function normalizeTitle(title) {
  return String(title ?? "").trim();
}

export function createTask(title, description = "") {
  const normalizedTitle = normalizeTitle(title);
  if (!normalizedTitle) throw new Error("タイトルを入力してください");

  return {
    id: globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`,
    title: normalizedTitle,
    description: String(description).trim(),
    completed: false,
  };
}

export function updateTask(tasks, id, changes) {
  const title = normalizeTitle(changes.title);
  if (!title) throw new Error("タイトルを入力してください");

  return tasks.map((task) => task.id === id
    ? { ...task, title, description: String(changes.description ?? "").trim() }
    : task);
}

export function loadTasks(storage) {
  try {
    const value = JSON.parse(storage.getItem(STORAGE_KEY));
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

export function saveTasks(storage, tasks) {
  storage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}
