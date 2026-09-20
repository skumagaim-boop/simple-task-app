import test from "node:test";
import assert from "node:assert/strict";
import { createTask, loadTasks, saveTasks, STORAGE_KEY, updateTask } from "./task-store.js";

test("createTask trims entered values", () => {
  const task = createTask("  原稿を書く  ", "  月曜まで  ");
  assert.equal(task.title, "原稿を書く");
  assert.equal(task.description, "月曜まで");
});

test("createTask rejects a whitespace-only title", () => {
  assert.throws(() => createTask("   \n"), /タイトルを入力/);
});

test("updateTask updates only the selected task without mutating input", () => {
  const tasks = [{ id: "1", title: "旧", description: "旧説明", completed: false }, { id: "2", title: "別", description: "", completed: false }];
  const updated = updateTask(tasks, "1", { title: " 新 ", description: " 新説明 " });
  assert.deepEqual(updated[0], { id: "1", title: "新", description: "新説明", completed: false });
  assert.equal(updated[1], tasks[1]);
  assert.equal(tasks[0].title, "旧");
});

test("updateTask rejects an empty title and leaves tasks unchanged", () => {
  const tasks = [{ id: "1", title: "元のタイトル", description: "", completed: false }];
  assert.throws(() => updateTask(tasks, "1", { title: "\t", description: "変更" }), /タイトルを入力/);
  assert.equal(tasks[0].title, "元のタイトル");
});

test("tasks round-trip through storage", () => {
  const memory = new Map();
  const storage = { getItem: (key) => memory.get(key) ?? null, setItem: (key, value) => memory.set(key, value) };
  const tasks = [{ id: "1", title: "保存", description: "", completed: false }];
  saveTasks(storage, tasks);
  assert.equal(memory.has(STORAGE_KEY), true);
  assert.deepEqual(loadTasks(storage), tasks);
});
