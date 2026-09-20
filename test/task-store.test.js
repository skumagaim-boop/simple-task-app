import assert from "node:assert/strict";
import test from "node:test";
import { STORAGE_KEY, addTask, loadTasks, removeTask, saveTasks, toggleTask } from "../task-store.js";

function memoryStorage(initialValue = null) {
  let value = initialValue;
  return {
    getItem: (key) => key === STORAGE_KEY ? value : null,
    setItem: (key, nextValue) => { if (key === STORAGE_KEY) value = nextValue; },
  };
}

test("タスクを未完了の状態で追加する", () => {
  assert.deepEqual(addTask([], "  牛乳を買う  ", "task-1"), [
    { id: "task-1", title: "牛乳を買う", completed: false },
  ]);
});

test("完了状態を切り替え、もう一度切り替えると未完了に戻す", () => {
  const tasks = [{ id: "task-1", title: "牛乳を買う", completed: false }];
  const completed = toggleTask(tasks, "task-1");
  assert.equal(completed[0].completed, true);
  assert.equal(toggleTask(completed, "task-1")[0].completed, false);
});

test("保存した完了状態を再読み込みできる", () => {
  const storage = memoryStorage();
  const tasks = [{ id: "task-1", title: "牛乳を買う", completed: true }];
  saveTasks(tasks, storage);
  assert.deepEqual(loadTasks(storage), tasks);
});

test("対象のタスクだけを削除する", () => {
  const tasks = [
    { id: "task-1", title: "A", completed: false },
    { id: "task-2", title: "B", completed: true },
  ];
  assert.deepEqual(removeTask(tasks, "task-1"), [tasks[1]]);
});

test("壊れた保存データは空の一覧として扱う", () => {
  assert.deepEqual(loadTasks(memoryStorage("not-json")), []);
});
