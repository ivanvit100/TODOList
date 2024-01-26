import { Task, TaskList, TaskManager } from "./Tasks.js";

document.addEventListener("DOMContentLoaded", () => {
  //Запуск приложения
  let taskManager = new TaskManager();
  let taskList: TaskList | undefined;
  let task: Task | undefined;
  const newTask = document.querySelector("#new-task") as HTMLButtonElement;
  const newTaskList = document.querySelector("#new-tasklist") as HTMLButtonElement;
  let login: string;
  let password: string;

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
    else{
      for (let task of taskList!.getTasks())
        listUI.innerHTML += `<li><button onclick="changeTask('${task.name}')">${task.name} <span class="notification">${task.lvl}</span></button></li>`;
      const title = document.querySelector("#list-name") as HTMLSpanElement;
      title.innerText = taskList.name;
      updateManagerUI();
    }
  }
  function updateTaskUI() {
    //Обновление информации о задаче (правая часть)
    const taskUI = document.querySelector("#task") as HTMLDivElement;
    if (!taskList) throw new Error(`[updateTaskUI]: Task not found`);
    else{
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
  }

  (window as any).changeTaskList = function (name: string) {
    //Смена списка задач
    taskList = taskManager.getLists().find((l) => l.name === name);
    if (!taskList)
      throw new Error(`[changeTaskList]: TaskList with name ${name} not found`);
    else
      updateListUI();
  };
  (window as any).changeTask = function (name: string) {
    //Смена задачи
    if (!taskList) throw new Error(`[changeTask]: TaskList not found`);
    else{
      task = taskList!.getTasks().find((t) => t.name === name);
      updateTaskUI();
    }
  };

  newTask.addEventListener("click", () => {
    //Добаваление новой задачи
    const name = document.querySelector("#task-name") as HTMLInputElement;
    const description = document.querySelector(
      "#task-description"
    ) as HTMLInputElement;
    const taskN = new Task(name.value, description.value);
    if (!taskList) throw new Error(`[newTask]: TaskList not found`);
    else{
      taskList!.addTask(taskN);
      updateListUI();
    }
  });
  newTaskList.addEventListener("click", () => {
    //Добаваление нвого списка задач
    const name = document.querySelector("#tasklist-name") as HTMLInputElement;
    const taskListN = new TaskList(name.value);
    taskManager!.addList(taskListN);
    updateManagerUI();
  });

  function notification(message: string, type: string = "info") {
    //Вывод уведомления
    const notification = document.createElement('div');
    notification.classList.add('notification-msg', type);
    notification.textContent = message;
    document.body.appendChild(notification);
    setTimeout(() => {
      notification.remove();
    }, 2000);
  }

  //Вход в систему
  const modal = document.querySelector("#modal-enter") as HTMLButtonElement;
  modal.addEventListener("click", () => auth());
  async function auth() {
    try {
      const loginInp = document.querySelector("#modal-login") as HTMLInputElement;
      const passwordInp = document.querySelector("#modal-password") as HTMLInputElement;
      login = loginInp.value.trim();
      password = passwordInp.value.trim();
      if(login === "" || password === ""){
        notification("Заполните поля", "error");
        throw new Error(`Login or password is empty`);
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
      else{
        const data = await response.json();
        notification(data.message, data.status);
        if(data.status === "success"){
          const hide = document.querySelector(".modal") as HTMLDivElement;
          hide.style.display = "none";
          getTaskListList();
        }
      }
    } catch (error: any) {
      console.error(`[auth]: ${error.message}`);
    }
  }
  //Получение списка списков задач
  async function getTaskListList() {
    try{
      const response = await fetch('https://vigilant-carnival-7xg7w7jp6v73rww5-5000.app.github.dev/api/getTaskListList', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          login: login,
          password: password
        })
      });
      const data = await response.json();
      for(let i = 0; i < data.data.length; i++){
        taskList = new TaskList(data.data[i]);
        taskManager.addList(taskList);
        await getTaskList(data.data[i]);
      }
      updateManagerUI();
    } catch (error: any) {
      console.error(`[getTaskListList]: ${error.message}`);
    }
  }
  //Получение списка задач
  async function getTaskList(name: string = "default") {
    try{
      const response = await fetch('https://vigilant-carnival-7xg7w7jp6v73rww5-5000.app.github.dev/api/getTaskList', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          taskList: name,
          login: login,
          password: password
        })
      });
      const data = await response.json();
      let ar = data.data.data;
      console.log(taskList);
      for(let i = 0; i < ar.length; i++){
        let newTask = new Task(ar[i].name, ar[i].description, ar[i].done, ar[i].date, ar[i].lvl);
        taskList?.addTask(newTask);
      }
    } catch (error: any) {
      console.error(`[getTaskList]: ${error.message}`);
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
