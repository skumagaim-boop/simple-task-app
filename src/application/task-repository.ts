import type { Task } from "../domain/task";

export interface TaskRepository {
  getAll(): Task[];
  saveAll(tasks: readonly Task[]): void;
}
