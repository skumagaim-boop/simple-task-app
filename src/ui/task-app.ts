import type { TaskService } from "../application/task-service";

export class TaskApp {
  constructor(private readonly root: HTMLElement, private readonly tasks: TaskService) {}

  mount(): void {
    this.root.innerHTML = `
      <section class="shell">
        <header><span class="eyebrow">MY WORKSPACE</span><h1>今日のタスク</h1><p>やるべきことを、シンプルに。</p></header>
        <form class="add-form" aria-label="タスクを追加">
          <input name="title" aria-label="タイトル" placeholder="新しいタスクを入力…" autocomplete="off" />
          <button type="submit">追加</button>
        </form>
        <p class="error" role="alert"></p>
        <div class="summary"></div><ul class="tasks"></ul>
      </section>`;
    this.root.querySelector("form")?.addEventListener("submit", (event) => this.add(event));
    this.render();
  }

  private add(event: SubmitEvent): void {
    event.preventDefault();
    const form = event.currentTarget as HTMLFormElement;
    const data = new FormData(form);
    this.run(() => { this.tasks.createTask({ title: String(data.get("title") ?? "") }); form.reset(); });
  }

  private render(): void {
    this.run(() => {
      const tasks = this.tasks.getTasks();
      const list = this.root.querySelector<HTMLUListElement>(".tasks")!;
      this.root.querySelector<HTMLElement>(".summary")!.textContent = tasks.length ? `${tasks.filter((t) => t.completed).length} / ${tasks.length} 完了` : "タスクはまだありません";
      list.replaceChildren(...tasks.map((task) => {
        const item = document.createElement("li");
        item.className = task.completed ? "completed" : "";
        const check = document.createElement("input"); check.type = "checkbox"; check.checked = task.completed; check.ariaLabel = `${task.title}を完了にする`;
        check.addEventListener("change", () => this.run(() => this.tasks.setCompleted(task.id, check.checked)));
        const title = document.createElement("span"); title.textContent = task.title;
        const remove = document.createElement("button"); remove.className = "delete"; remove.textContent = "削除";
        remove.addEventListener("click", () => this.run(() => this.tasks.deleteTask(task.id)));
        item.append(check, title, remove); return item;
      }));
    }, false);
  }

  private run(action: () => unknown, rerender = true): void {
    const error = this.root.querySelector<HTMLElement>(".error");
    try { action(); if (error) error.textContent = ""; if (rerender) this.render(); }
    catch (cause) { if (error) error.textContent = cause instanceof Error ? cause.message : "予期しないエラーが発生しました"; }
  }
}
