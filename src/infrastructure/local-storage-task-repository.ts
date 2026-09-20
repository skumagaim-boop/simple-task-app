import type { TaskRepository } from "../application/task-repository";
import type { Task } from "../domain/task";

export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

export class TaskPersistenceError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "TaskPersistenceError";
  }
}

export class LocalStorageTaskRepository implements TaskRepository {
  constructor(
    private readonly storage: StorageLike,
    private readonly key = "simple-task-app.tasks.v1",
  ) {}

  getAll(): Task[] {
    try {
      const value = this.storage.getItem(this.key);
      if (value === null) return [];
      const parsed: unknown = JSON.parse(value);
      if (!Array.isArray(parsed) || !parsed.every(isTask)) throw new Error("Invalid task data");
      return parsed.map((task) => ({ ...task }));
    } catch (cause) {
      throw new TaskPersistenceError("保存済みタスクを読み込めませんでした", { cause });
    }
  }

  saveAll(tasks: readonly Task[]): void {
    try {
      this.storage.setItem(this.key, JSON.stringify(tasks));
    } catch (cause) {
      throw new TaskPersistenceError("タスクを保存できませんでした", { cause });
    }
  }
}

function isTask(value: unknown): value is Task {
  if (typeof value !== "object" || value === null) return false;
  const task = value as Record<string, unknown>;
  return (
    typeof task.id === "string" && task.id.length > 0 &&
    typeof task.title === "string" && task.title.trim().length > 0 &&
    (task.description === undefined || typeof task.description === "string") &&
    typeof task.completed === "boolean" &&
    isDateString(task.createdAt) && isDateString(task.updatedAt)
  );
}

function isDateString(value: unknown): value is string {
  return typeof value === "string" && !Number.isNaN(Date.parse(value));
}
