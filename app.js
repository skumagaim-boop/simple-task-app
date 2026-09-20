import { createTask, loadTasks, saveTasks, updateTask } from "./task-store.js";

const createForm = document.querySelector("#create-form");
const editForm = document.querySelector("#edit-form");
const editDialog = document.querySelector("#edit-dialog");
const taskList = document.querySelector("#task-list");
const template = document.querySelector("#task-template");
const count = document.querySelector("#task-count");
let tasks = loadTasks(localStorage);

function persistAndRender(nextTasks) {
  tasks = nextTasks;
  saveTasks(localStorage, tasks);
  render();
}

function render() {
  taskList.replaceChildren();
  count.textContent = `${tasks.length}件`;
  if (!tasks.length) {
    const empty = document.createElement("div");
    empty.className = "empty-state";
    empty.innerHTML = "<strong>タスクはまだありません</strong><p>上のフォームから最初のタスクを追加しましょう。</p>";
    taskList.append(empty);
    return;
  }

  tasks.forEach((task) => {
    const card = template.content.firstElementChild.cloneNode(true);
    card.dataset.id = task.id;
    card.classList.toggle("completed", task.completed);
    card.querySelector("h3").textContent = task.title;
    const description = card.querySelector(".task-content p");
    description.textContent = task.description;
    description.hidden = !task.description;
    card.querySelector(".complete-button").setAttribute("aria-pressed", String(task.completed));
    card.querySelector(".edit-button").addEventListener("click", () => openEditor(task));
    card.querySelector(".delete-button").addEventListener("click", () => persistAndRender(tasks.filter(({ id }) => id !== task.id)));
    card.querySelector(".complete-button").addEventListener("click", () => persistAndRender(tasks.map((item) => item.id === task.id ? { ...item, completed: !item.completed } : item)));
    taskList.append(card);
  });
}

function openEditor(task) {
  editForm.elements.id.value = task.id;
  editForm.elements.title.value = task.title;
  editForm.elements.description.value = task.description;
  document.querySelector("#edit-error").textContent = "";
  editDialog.showModal();
  editForm.elements.title.focus();
}

createForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const error = document.querySelector("#create-error");
  try {
    persistAndRender([createTask(createForm.elements.title.value, createForm.elements.description.value), ...tasks]);
    createForm.reset();
    error.textContent = "";
    createForm.elements.title.focus();
  } catch (exception) {
    error.textContent = exception.message;
    createForm.elements.title.focus();
  }
});

editForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const error = document.querySelector("#edit-error");
  try {
    persistAndRender(updateTask(tasks, editForm.elements.id.value, {
      title: editForm.elements.title.value,
      description: editForm.elements.description.value,
    }));
    error.textContent = "";
    editDialog.close();
  } catch (exception) {
    error.textContent = exception.message;
    editForm.elements.title.focus();
  }
});

document.querySelector("#cancel-edit").addEventListener("click", () => editDialog.close());
document.querySelector("#close-edit").addEventListener("click", () => editDialog.close());
editDialog.addEventListener("click", (event) => {
  if (event.target === editDialog) editDialog.close();
});

render();
