import {
  normalizeTitle,
  TaskNotFoundError,
  type CreateTaskInput,
  type Task,
  type UpdateTaskInput,
} from "../domain/task";
import type { TaskRepository } from "./task-repository";

type Clock = () => Date;
type IdGenerator = () => string;

export class TaskService {
  constructor(
    private readonly repository: TaskRepository,
    private readonly now: Clock = () => new Date(),
    private readonly createId: IdGenerator = () => crypto.randomUUID(),
  ) {}

  getTasks(): Task[] {
    return this.repository.getAll().sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  getTask(id: string): Task {
    return this.find(this.repository.getAll(), id);
  }

  createTask(input: CreateTaskInput): Task {
    const timestamp = this.now().toISOString();
    const task: Task = {
      id: this.createId(),
      title: normalizeTitle(input.title),
      ...(input.description?.trim() ? { description: input.description.trim() } : {}),
      completed: false,
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    const tasks = this.repository.getAll();
    this.repository.saveAll([...tasks, task]);
    return task;
  }

  updateTask(id: string, input: UpdateTaskInput): Task {
    const tasks = this.repository.getAll();
    const current = this.find(tasks, id);
    const description = input.description === undefined ? current.description : input.description.trim() || undefined;
    const updated: Task = {
      ...current,
      title: input.title === undefined ? current.title : normalizeTitle(input.title),
      description,
      updatedAt: this.now().toISOString(),
    };
    this.replaceAndSave(tasks, updated);
    return updated;
  }

  setCompleted(id: string, completed: boolean): Task {
    const tasks = this.repository.getAll();
    const current = this.find(tasks, id);
    const updated = { ...current, completed, updatedAt: this.now().toISOString() };
    this.replaceAndSave(tasks, updated);
    return updated;
  }

  deleteTask(id: string): void {
    const tasks = this.repository.getAll();
    this.find(tasks, id);
    this.repository.saveAll(tasks.filter((task) => task.id !== id));
  }

  private find(tasks: Task[], id: string): Task {
    const task = tasks.find((candidate) => candidate.id === id);
    if (!task) throw new TaskNotFoundError(id);
    return task;
  }

  private replaceAndSave(tasks: Task[], updated: Task): void {
    this.repository.saveAll(tasks.map((task) => (task.id === updated.id ? updated : task)));
  }
}
