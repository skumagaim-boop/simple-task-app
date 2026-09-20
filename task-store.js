export const partitionTasks = (tasks) => ({
  open: tasks.filter((task) => !task.completed),
  done: tasks.filter((task) => task.completed),
});

export const toggleTask = (tasks, id) =>
  tasks.map((task) => task.id === id ? { ...task, completed: !task.completed } : task);

export const updateTask = (tasks, id, title) =>
  tasks.map((task) => task.id === id ? { ...task, title: title.trim() } : task);

export const removeTask = (tasks, id) => tasks.filter((task) => task.id !== id);
