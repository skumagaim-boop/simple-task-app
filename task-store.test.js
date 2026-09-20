import assert from 'node:assert/strict';
import test from 'node:test';
import { createTask, loadTasks, saveTasks, STORAGE_KEY, validateTitle } from './task-store.js';

test('空または空白のみのタイトルを拒否する', () => {
  assert.equal(validateTitle(''), 'タイトルを入力してください。');
  assert.equal(validateTitle('   \n'), 'タイトルを入力してください。');
  assert.throws(() => createTask('  '), /タイトルを入力してください/);
});

test('タイトルと説明を整形し、未完了のタスクを作成する', () => {
  const task = createTask('  資料を作る  ', '  午前中まで  ', 'task-1');
  assert.equal(task.id, 'task-1');
  assert.equal(task.title, '資料を作る');
  assert.equal(task.description, '午前中まで');
  assert.equal(task.completed, false);
  assert.match(task.createdAt, /^\d{4}-\d{2}-\d{2}T/);
});

test('説明を省略してタスクを作成できる', () => {
  assert.equal(createTask('買い物', undefined, 'task-2').description, '');
});

test('タスクをストレージへ保存して読み込む', () => {
  const values = new Map();
  const storage = { getItem: (key) => values.get(key) ?? null, setItem: (key, value) => values.set(key, value) };
  const tasks = [createTask('テスト', '', 'task-3')];
  saveTasks(storage, tasks);
  assert.equal(values.has(STORAGE_KEY), true);
  assert.deepEqual(loadTasks(storage), tasks);
});

test('壊れた保存データは空の一覧として扱う', () => {
  assert.deepEqual(loadTasks({ getItem: () => '{broken' }), []);
  assert.deepEqual(loadTasks({ getItem: () => '{}' }), []);
});
