import { partitionTasks, removeTask, toggleTask, updateTask } from './task-store.js';

const STORAGE_KEY = 'simple-task-app.tasks';
const elements = {
  form: document.querySelector('#task-form'), title: document.querySelector('#task-title'),
  openList: document.querySelector('#open-list'), doneList: document.querySelector('#done-list'),
  openEmpty: document.querySelector('#open-empty'), doneEmpty: document.querySelector('#done-empty'),
  openCount: document.querySelector('#open-count'), doneCount: document.querySelector('#done-count'),
  progress: document.querySelector('#progress-count'), template: document.querySelector('#task-template'),
  dialog: document.querySelector('#edit-dialog'), editForm: document.querySelector('#edit-form'),
  editTitle: document.querySelector('#edit-title'), editCancel: document.querySelector('#edit-cancel'),
};

let tasks = loadTasks();
let editingId = null;

function loadTasks() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return Array.isArray(saved) ? saved : [];
  } catch { return []; }
}

function saveAndRender() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  render();
}

function makeTaskElement(task) {
  const item = elements.template.content.firstElementChild.cloneNode(true);
  item.dataset.id = task.id;
  item.classList.toggle('is-complete', task.completed);
  item.querySelector('.task-text').textContent = task.title;
  item.querySelector('.toggle').setAttribute('aria-label', task.completed ? '未完了に戻す' : '完了にする');
  item.querySelector('.toggle').addEventListener('click', () => {
    tasks = toggleTask(tasks, task.id);
    saveAndRender();
  });
  item.querySelector('.edit').addEventListener('click', () => {
    editingId = task.id;
    elements.editTitle.value = task.title;
    elements.dialog.showModal();
    elements.editTitle.select();
  });
  item.querySelector('.delete').addEventListener('click', () => {
    if (confirm(`「${task.title}」を削除しますか？`)) {
      tasks = removeTask(tasks, task.id);
      saveAndRender();
    }
  });
  return item;
}

function render() {
  const { open, done } = partitionTasks(tasks);
  elements.openList.replaceChildren(...open.map(makeTaskElement));
  elements.doneList.replaceChildren(...done.map(makeTaskElement));
  elements.openEmpty.hidden = open.length > 0;
  elements.doneEmpty.hidden = done.length > 0;
  elements.openCount.textContent = open.length;
  elements.doneCount.textContent = done.length;
  elements.progress.textContent = `${done.length} / ${tasks.length}`;
}

elements.form.addEventListener('submit', (event) => {
  event.preventDefault();
  const title = elements.title.value.trim();
  if (!title) return;
  tasks.unshift({ id: crypto.randomUUID(), title, completed: false });
  elements.form.reset();
  saveAndRender();
});

elements.editForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const title = elements.editTitle.value.trim();
  if (!title) return;
  tasks = updateTask(tasks, editingId, title);
  elements.dialog.close();
  saveAndRender();
});

elements.editCancel.addEventListener('click', () => elements.dialog.close());

render();
