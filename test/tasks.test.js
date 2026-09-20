import assert from "node:assert/strict";
import test from "node:test";
import { loadTasks, removeTask, saveTasks, STORAGE_KEY } from "../src/tasks.js";

function memoryStorage(initialValue = null) {
  let value = initialValue;
  return {
    getItem: () => value,
    setItem: (_key, nextValue) => { value = nextValue; },
    value: () => value,
  };
}

test("removeTask removes only the selected task", () => {
  const tasks = [{ id: "a" }, { id: "b" }];
  assert.deepEqual(removeTask(tasks, "a"), [{ id: "b" }]);
  assert.equal(tasks.length, 2);
});

test("tasks can be saved and loaded from persistent storage", () => {
  const storage = memoryStorage();
  const tasks = [{ id: "a", title: "買い物", completed: false }];
  saveTasks(storage, tasks);
  assert.equal(storage.value(), JSON.stringify(tasks));
  assert.deepEqual(loadTasks(storage), tasks);
});

test("loadTasks safely handles invalid stored data", () => {
  assert.deepEqual(loadTasks(memoryStorage("broken json")), []);
  assert.deepEqual(loadTasks(memoryStorage(JSON.stringify({ task: 1 }))), []);
  assert.equal(STORAGE_KEY, "simple-task-app.tasks");
});
