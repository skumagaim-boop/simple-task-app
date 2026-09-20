export const STORAGE_KEY = "simple-task-app.tasks";

export function loadTasks(storage = localStorage) {
  try {
    const value = JSON.parse(storage.getItem(STORAGE_KEY) ?? "[]");
    return Array.isArray(value)
      ? value.filter((task) => task && typeof task.id === "string" && typeof task.title === "string")
      : [];
  } catch {
    return [];
  }
}

export function saveTasks(tasks, storage = localStorage) {
  storage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

export function addTask(tasks, title, id = crypto.randomUUID()) {
  const trimmedTitle = title.trim();
  if (!trimmedTitle) return tasks;
  return [...tasks, { id, title: trimmedTitle, completed: false }];
}

export function toggleTask(tasks, id) {
  return tasks.map((task) =>
    task.id === id ? { ...task, completed: !task.completed } : task,
  );
}

export function removeTask(tasks, id) {
  return tasks.filter((task) => task.id !== id);
}
