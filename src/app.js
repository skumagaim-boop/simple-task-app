import { loadTasks, removeTask, saveTasks } from "./tasks.js";

const form = document.querySelector("#task-form");
const titleInput = document.querySelector("#task-title");
const list = document.querySelector("#task-list");
const count = document.querySelector("#task-count");
const emptyState = document.querySelector("#empty-state");
const template = document.querySelector("#task-template");

let tasks = loadTasks(localStorage);

function persistAndRender() {
  saveTasks(localStorage, tasks);
  render();
}

function render() {
  list.replaceChildren();

  for (const task of tasks) {
    const item = template.content.firstElementChild.cloneNode(true);
    const checkbox = item.querySelector("input");
    const text = item.querySelector(".task-text");
    const deleteButton = item.querySelector(".delete-button");

    text.textContent = task.title;
    checkbox.checked = task.completed;
    item.classList.toggle("completed", task.completed);
    deleteButton.setAttribute("aria-label", `「${task.title}」を削除`);

    checkbox.addEventListener("change", () => {
      task.completed = checkbox.checked;
      persistAndRender();
    });

    deleteButton.addEventListener("click", () => {
      if (!window.confirm(`「${task.title}」を削除しますか？\nこの操作は取り消せません。`)) return;
      tasks = removeTask(tasks, task.id);
      persistAndRender();
    });

    list.append(item);
  }

  count.textContent = `${tasks.length} 件`;
  emptyState.hidden = tasks.length > 0;
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const title = titleInput.value.trim();
  if (!title) return;

  tasks.unshift({ id: crypto.randomUUID(), title, completed: false });
  titleInput.value = "";
  persistAndRender();
  titleInput.focus();
});

render();
