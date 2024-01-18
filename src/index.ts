import { Task, TaskList, TaskManager } from "./Tasks.js";

document.addEventListener("DOMContentLoaded", () => {
  //Запуск приложения
  let taskManager = new TaskManager();
  let taskList: TaskList | undefined = new TaskList("default");
  taskManager.addList(taskList);
  let task: Task | undefined;
  const newTask = document.querySelector("#new-task") as HTMLButtonElement;
  const newTaskList = document.querySelector(
    "#new-tasklist"
  ) as HTMLButtonElement;

  function updateManagerUI() {
    //Обновление списка списков задач (левая часть)
    const managerUI = document.querySelector("#manager") as HTMLUListElement;
    managerUI.innerHTML = "";
    for (let taskList of taskManager.getLists())
      managerUI.innerHTML += `<li><button onclick="changeTaskList('${
        taskList.name
      }')">${taskList.name} <span class="notification">${
        taskList.getTasks().length
      }</span></button></li>`;
  }
  function updateListUI() {
    //Обновление списка задач (центральная часть)
    const listUI = document.querySelector("#list") as HTMLUListElement;
    listUI.innerHTML = "";
    if (!taskList) throw new Error(`[updateListUI]: TaskList not found`);
    for (let task of taskList!.getTasks())
      listUI.innerHTML += `<li><button onclick="changeTask('${task.name}')">${task.name} <span class="notification">${task.lvl}</span></button></li>`;
    const title = document.querySelector("#list-name") as HTMLSpanElement;
    title.innerText = taskList.name;
    updateManagerUI();
  }
  function updateTaskUI() {
    //Обновление информации о задаче (правая часть)
    const taskUI = document.querySelector("#task") as HTMLDivElement;
    if (!taskList) throw new Error(`[updateTaskUI]: Task not found`);
    taskUI.innerHTML = `<h2>${task!.name}</h2><p>${task!.description}</p>`;
  }

  (window as any).changeTaskList = function (name: string) {
    //Смена списка задач
    taskList = taskManager.getLists().find((l) => l.name === name);
    if (!taskList)
      throw new Error(`[changeTaskList]: TaskList with name ${name} not found`);
    updateListUI();
  };
  (window as any).changeTask = function (name: string) {
    //Смена задачи
    if (!taskList) throw new Error(`[changeTask]: TaskList not found`);
    task = taskList!.getTasks().find((t) => t.name === name);
    updateTaskUI();
  };

  updateManagerUI();
  updateListUI();

  newTask.addEventListener("click", () => {
    //Добаваление новой задачи
    const name = document.querySelector("#task-name") as HTMLInputElement;
    const description = document.querySelector(
      "#task-description"
    ) as HTMLInputElement;
    const taskN = new Task(name.value, description.value);
    if (!taskList) throw new Error(`[newTask]: TaskList not found`);
    taskList!.addTask(taskN);
    updateListUI();
  });
  newTaskList.addEventListener("click", () => {
    //Добаваление нвого списка задач
    const name = document.querySelector("#tasklist-name") as HTMLInputElement;
    const taskListN = new TaskList(name.value);
    taskManager!.addList(taskListN);
    updateManagerUI();
  });
});

let theme = true;
(window as any).switchTheme = function () {
  //Смена темы
  const body = document.querySelector("body") as HTMLBodyElement;
  theme ? body.classList.add("dark") : body.classList.remove("dark");
  theme = !theme;
}
