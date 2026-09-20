import { addTask, loadTasks, removeTask, saveTasks, toggleTask } from "./task-store.js";

const form = document.querySelector("#task-form");
const input = document.querySelector("#task-input");
const list = document.querySelector("#task-list");
const emptyState = document.querySelector("#empty-state");
const progressCount = document.querySelector("#progress-count");
const remainingCount = document.querySelector("#remaining-count");
const today = document.querySelector("#today");

let tasks = loadTasks();

today.textContent = new Intl.DateTimeFormat("ja-JP", {
  month: "long",
  day: "numeric",
  weekday: "long",
}).format(new Date());

function render() {
  list.replaceChildren(...tasks.map(createTaskItem));
  emptyState.hidden = tasks.length > 0;

  const completed = tasks.filter((task) => task.completed).length;
  progressCount.textContent = `${completed} / ${tasks.length}`;
  remainingCount.textContent = `${tasks.length - completed} 件`;
}

function createTaskItem(task) {
  const item = document.createElement("li");
  item.className = `task-item${task.completed ? " is-completed" : ""}`;

  const label = document.createElement("label");
  label.className = "check-label";
  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.checked = Boolean(task.completed);
  checkbox.setAttribute("aria-label", `${task.title}を${task.completed ? "未完了" : "完了"}にする`);
  checkbox.addEventListener("change", () => {
    tasks = toggleTask(tasks, task.id);
    persistAndRender();
  });
  const mark = document.createElement("span");
  mark.className = "checkmark";
  mark.setAttribute("aria-hidden", "true");
  label.append(checkbox, mark);

  const title = document.createElement("span");
  title.className = "task-title";
  title.textContent = task.title;

  const removeButton = document.createElement("button");
  removeButton.className = "delete-button";
  removeButton.type = "button";
  removeButton.setAttribute("aria-label", `${task.title}を削除`);
  removeButton.textContent = "×";
  removeButton.addEventListener("click", () => {
    tasks = removeTask(tasks, task.id);
    persistAndRender();
  });

  item.append(label, title, removeButton);
  return item;
}

function persistAndRender() {
  saveTasks(tasks);
  render();
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const updatedTasks = addTask(tasks, input.value);
  if (updatedTasks === tasks) return;
  tasks = updatedTasks;
  input.value = "";
  persistAndRender();
  input.focus();
});

render();
