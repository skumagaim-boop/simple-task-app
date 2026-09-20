import { createTask, loadTasks, saveTasks, validateTitle } from './task-store.js';

const form = document.querySelector('#task-form');
const titleInput = document.querySelector('#task-title');
const descriptionInput = document.querySelector('#task-description');
const errorMessage = document.querySelector('#title-error');
const taskList = document.querySelector('#task-list');
const taskCount = document.querySelector('#task-count');
const emptyTemplate = document.querySelector('#empty-template');
let tasks = loadTasks(localStorage);

function render() {
  taskList.replaceChildren();
  taskCount.textContent = `${tasks.length} 件`;

  if (tasks.length === 0) {
    taskList.append(emptyTemplate.content.cloneNode(true));
    return;
  }

  tasks.forEach((task) => {
    const article = document.createElement('article');
    article.className = 'task-card';

    const status = document.createElement('span');
    status.className = 'status-dot';
    status.setAttribute('aria-label', '未完了');

    const content = document.createElement('div');
    content.className = 'task-content';

    const title = document.createElement('h3');
    title.textContent = task.title;
    content.append(title);

    if (task.description) {
      const description = document.createElement('p');
      description.textContent = task.description;
      content.append(description);
    }

    const badge = document.createElement('span');
    badge.className = 'status-badge';
    badge.textContent = '未完了';
    article.append(status, content, badge);
    taskList.append(article);
  });
}

function showError(message) {
  errorMessage.textContent = message;
  titleInput.classList.toggle('invalid', Boolean(message));
  titleInput.setAttribute('aria-invalid', String(Boolean(message)));
}

titleInput.addEventListener('input', () => {
  if (errorMessage.textContent) showError(validateTitle(titleInput.value));
});

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const error = validateTitle(titleInput.value);
  showError(error);

  if (error) {
    titleInput.focus();
    return;
  }

  tasks = [createTask(titleInput.value, descriptionInput.value), ...tasks];
  saveTasks(localStorage, tasks);
  render();
  form.reset();
  showError('');
  titleInput.focus();
});

render();
