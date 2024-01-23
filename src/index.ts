import { Task, TaskList, TaskManager } from "./Tasks.js";

document.addEventListener("DOMContentLoaded", () => {
  //Запуск приложения
  let taskManager = new TaskManager();
  let taskList: TaskList | undefined = new TaskList("default");
  taskManager.addList(taskList);
  let task: Task | undefined;
  const newTask = document.querySelector("#new-task") as HTMLButtonElement;
  const newTaskList = document.querySelector("#new-tasklist") as HTMLButtonElement;

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
    taskUI.innerHTML = `<div class="task-view">
    <div class="inner-header" id="task-title">
      <span class="inner-header-title">${task!.name}</span>
    </div>
    <p class="task-description">${task!.description}</p>
  </div>
  <div class="task-bottom">
      <div class="task-icons">
        <img src="./pub/icons/edit.png" alt="Редактировать" class="task-icon">
        <img src="./pub/icons/delete.png" alt="Удалить" class="task-icon">
      </div>
      <div class="task-details">
        <span class="task-importance">Уровень важности: ${task!.lvl}</span>
        <span class="task-deadline">Срок выполнения: ${task!.date}</span>
      </div>
      <div class="task-tag">
        <span class="tag">${taskList!.name}</span>
      </div>
    </div>`;
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

  //Вход в систему
  const modal = document.querySelector("#modal-enter") as HTMLButtonElement;
  modal.addEventListener("click", () => auth());
  async function auth() {
    try {
      const login = document.querySelector("#modal-login") as HTMLInputElement;
      const password = document.querySelector("#modal-password") as HTMLInputElement;
      if(login.value.trim() === "" || password.value.trim() === ""){
        throw new Error(`[auth]: Login or password is empty`);
      }
      const response = await fetch('https://vigilant-carnival-7xg7w7jp6v73rww5-5000.app.github.dev/api/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          login: login,
          password: password
        })
      });
  
      if (!response.ok)
        throw new Error(`[auth]: HTTP Error (${response.status})`);
      const data = await response.json();
      console.log(data);
      getTaskList();
    } catch (error: any) {
      console.error(`[auth]: ${error.message}`);
    }
  }
  //Получение списка задач
  async function getTaskList() {
    try{
      const response = await fetch('https://vigilant-carnival-7xg7w7jp6v73rww5-5000.app.github.dev/api/getTaskList', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          taskList: "Продукты"
        })
      });
      const data = await response.json();
      interface TaskInt {
        name: string;
        done: string;
        description: string;
        date: Date | null;
        lvl: number;
      }
      taskList = new TaskList(data.name);
      taskManager.addList(taskList);
      let ar = data.data.data;
      for(let i = 0; i < ar.length; i++){
        let newTask = new Task(ar[i].name, ar[i].description, ar[i].done, ar[i].date, ar[i].lvl);
        taskList?.addTask(newTask);
        console.log(newTask);
      }
      updateListUI();
    } catch (error: any) {
      console.error(`[auth]: ${error.message}`);
    }
  }
});

let theme = true;
(window as any).switchTheme = function () {
  //Смена темы
  const body = document.querySelector("body") as HTMLBodyElement;
  theme ? body.classList.add("dark") : body.classList.remove("dark");
  theme = !theme;
}
