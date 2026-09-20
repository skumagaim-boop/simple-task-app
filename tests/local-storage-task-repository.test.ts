import { describe, expect, it } from "vitest";
import { LocalStorageTaskRepository } from "../src/infrastructure/local-storage-task-repository";

class MemoryStorage {
  value: string | null = null;
  getItem() { return this.value; }
  setItem(_key: string, value: string) { this.value = value; }
}

describe("LocalStorageTaskRepository", () => {
  it("reloads saved tasks", () => {
    const storage = new MemoryStorage(); const repository = new LocalStorageTaskRepository(storage);
    const task = { id: "1", title: "Persist", completed: false, createdAt: "2026-09-20T00:00:00.000Z", updatedAt: "2026-09-20T00:00:00.000Z" };
    repository.saveAll([task]);
    expect(new LocalStorageTaskRepository(storage).getAll()).toEqual([task]);
  });

  it("rejects corrupted persisted data", () => {
    const storage = new MemoryStorage(); storage.value = '{"bad":true}';
    expect(() => new LocalStorageTaskRepository(storage).getAll()).toThrow("保存済みタスクを読み込めませんでした");
  });
});
