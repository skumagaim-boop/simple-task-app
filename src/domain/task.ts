export interface Task {
  readonly id: string;
  title: string;
  description?: string;
  completed: boolean;
  readonly createdAt: string;
  updatedAt: string;
}

export interface CreateTaskInput {
  title: string;
  description?: string;
}

export interface UpdateTaskInput {
  title?: string;
  description?: string;
}

export class TaskValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TaskValidationError";
  }
}

export class TaskNotFoundError extends Error {
  constructor(id: string) {
    super(`タスクが見つかりません: ${id}`);
    this.name = "TaskNotFoundError";
  }
}

export function normalizeTitle(title: string): string {
  const normalized = title.trim();
  if (!normalized) throw new TaskValidationError("タイトルを入力してください");
  return normalized;
}
