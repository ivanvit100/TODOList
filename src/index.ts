import { Task, TaskList, TaskManager } from "./Tasks.js";

document.addEventListener("DOMContentLoaded", () => {
  let taskManager = new TaskManager();
  let taskList = new TaskList("default");
  taskManager.addList(taskList);
  const newTask = document.querySelector("#new-task") as HTMLButtonElement;
  newTask.addEventListener("click", () => {
    const name = document.querySelector("#task-name") as HTMLInputElement;
    const description = document.querySelector("#task-description") as HTMLInputElement;
    const task = new Task(name.value, description.value);
    taskList.addTask(task);
    console.log(taskManager.getLists());
  });
});