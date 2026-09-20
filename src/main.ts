import "./style.css";
import { TaskService } from "./application/task-service";
import { LocalStorageTaskRepository } from "./infrastructure/local-storage-task-repository";
import { TaskApp } from "./ui/task-app";

const root = document.querySelector<HTMLElement>("#app");
if (!root) throw new Error("App root was not found");

new TaskApp(root, new TaskService(new LocalStorageTaskRepository(localStorage))).mount();
