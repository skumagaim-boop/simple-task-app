import { describe, expect, it } from "vitest";
import { TaskService } from "../src/application/task-service";
import type { TaskRepository } from "../src/application/task-repository";
import type { Task } from "../src/domain/task";

class MemoryRepository implements TaskRepository {
  tasks: Task[] = [];
  getAll() { return this.tasks.map((task) => ({ ...task })); }
  saveAll(tasks: readonly Task[]) { this.tasks = tasks.map((task) => ({ ...task })); }
}

const time = new Date("2026-09-20T12:00:00.000Z");
const setup = () => { const repository = new MemoryRepository(); return { repository, service: new TaskService(repository, () => time, () => "task-1") }; };

describe("TaskService", () => {
  it("creates and reads a normalized task", () => {
    const { service } = setup();
    const created = service.createTask({ title: "  Ship it  ", description: " notes " });
    expect(created).toEqual({ id: "task-1", title: "Ship it", description: "notes", completed: false, createdAt: time.toISOString(), updatedAt: time.toISOString() });
    expect(service.getTask("task-1")).toEqual(created);
  });

  it("rejects an empty title without persisting it", () => {
    const { repository, service } = setup();
    expect(() => service.createTask({ title: "   " })).toThrow("タイトルを入力してください");
    expect(repository.tasks).toEqual([]);
  });

  it("updates, completes, and deletes a task", () => {
    const { service } = setup(); service.createTask({ title: "Old" });
    expect(service.updateTask("task-1", { title: "New", description: "Detail" }).title).toBe("New");
    expect(service.setCompleted("task-1", true).completed).toBe(true);
    service.deleteTask("task-1"); expect(service.getTasks()).toEqual([]);
  });

  it("reports an unknown task", () => {
    const { service } = setup();
    expect(() => service.deleteTask("missing")).toThrow("タスクが見つかりません: missing");
  });
});
