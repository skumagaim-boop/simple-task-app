import test from 'node:test';
import assert from 'node:assert/strict';
import { partitionTasks, removeTask, toggleTask, updateTask } from './task-store.js';

const tasks = [
  { id: '1', title: '未完了', completed: false },
  { id: '2', title: '完了', completed: true },
];

test('タスクを状態別に分ける', () => {
  const result = partitionTasks(tasks);
  assert.deepEqual(result.open.map(({ id }) => id), ['1']);
  assert.deepEqual(result.done.map(({ id }) => id), ['2']);
});

test('完了状態を切り替える', () => {
  assert.equal(toggleTask(tasks, '1')[0].completed, true);
  assert.equal(toggleTask(tasks, '2')[1].completed, false);
});

test('編集時は前後の空白を除き、対象外は維持する', () => {
  const result = updateTask(tasks, '1', '  更新後  ');
  assert.equal(result[0].title, '更新後');
  assert.deepEqual(result[1], tasks[1]);
});

test('指定したタスクだけを削除する', () => {
  assert.deepEqual(removeTask(tasks, '1'), [tasks[1]]);
});
