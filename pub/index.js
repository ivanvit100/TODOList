var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Task, TaskList, TaskManager } from "./Tasks.js";
document.addEventListener("DOMContentLoaded", () => {
    let taskManager = new TaskManager();
    let taskList = new TaskList("default");
    taskManager.addList(taskList);
    let task;
    const newTask = document.querySelector("#new-task");
    const newTaskList = document.querySelector("#new-tasklist");
    function updateManagerUI() {
        const managerUI = document.querySelector("#manager");
        managerUI.innerHTML = "";
        for (let taskList of taskManager.getLists())
            managerUI.innerHTML += `<li><button onclick="changeTaskList('${taskList.name}')">${taskList.name} <span class="notification">${taskList.getTasks().length}</span></button></li>`;
    }
    function updateListUI() {
        const listUI = document.querySelector("#list");
        listUI.innerHTML = "";
        if (!taskList)
            throw new Error(`[updateListUI]: TaskList not found`);
        for (let task of taskList.getTasks())
            listUI.innerHTML += `<li><button onclick="changeTask('${task.name}')">${task.name} <span class="notification">${task.lvl}</span></button></li>`;
        const title = document.querySelector("#list-name");
        title.innerText = taskList.name;
        updateManagerUI();
    }
    function updateTaskUI() {
        const taskUI = document.querySelector("#task");
        if (!taskList)
            throw new Error(`[updateTaskUI]: Task not found`);
        taskUI.innerHTML = `<div class="task-view">
    <div class="inner-header" id="task-title">
      <span class="inner-header-title">${task.name}</span>
    </div>
    <p class="task-description">${task.description}</p>
  </div>
  <div class="task-bottom">
      <div class="task-icons">
        <img src="./pub/icons/edit.png" alt="Редактировать" class="task-icon">
        <img src="./pub/icons/delete.png" alt="Удалить" class="task-icon">
      </div>
      <div class="task-details">
        <span class="task-importance">Уровень важности: ${task.lvl}</span>
        <span class="task-deadline">Срок выполнения: ${task.date}</span>
      </div>
      <div class="task-tag">
        <span class="tag">${taskList.name}</span>
      </div>
    </div>`;
    }
    window.changeTaskList = function (name) {
        taskList = taskManager.getLists().find((l) => l.name === name);
        if (!taskList)
            throw new Error(`[changeTaskList]: TaskList with name ${name} not found`);
        updateListUI();
    };
    window.changeTask = function (name) {
        if (!taskList)
            throw new Error(`[changeTask]: TaskList not found`);
        task = taskList.getTasks().find((t) => t.name === name);
        updateTaskUI();
    };
    updateManagerUI();
    updateListUI();
    newTask.addEventListener("click", () => {
        const name = document.querySelector("#task-name");
        const description = document.querySelector("#task-description");
        const taskN = new Task(name.value, description.value);
        if (!taskList)
            throw new Error(`[newTask]: TaskList not found`);
        taskList.addTask(taskN);
        updateListUI();
    });
    newTaskList.addEventListener("click", () => {
        const name = document.querySelector("#tasklist-name");
        const taskListN = new TaskList(name.value);
        taskManager.addList(taskListN);
        updateManagerUI();
    });
    const modal = document.querySelector("#modal-enter");
    modal.addEventListener("click", () => auth());
    function auth() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const login = document.querySelector("#modal-login");
                const password = document.querySelector("#modal-password");
                if (login.value.trim() === "" || password.value.trim() === "") {
                    throw new Error(`[auth]: Login or password is empty`);
                }
                const response = yield fetch('https://vigilant-carnival-7xg7w7jp6v73rww5-5000.app.github.dev/api/auth', {
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
                const data = yield response.json();
                console.log(data);
                getTaskList();
            }
            catch (error) {
                console.error(`[auth]: ${error.message}`);
            }
        });
    }
    function getTaskList() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield fetch('https://vigilant-carnival-7xg7w7jp6v73rww5-5000.app.github.dev/api/getTaskList', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        taskList: "Продукты"
                    })
                });
                const data = yield response.json();
                taskList = new TaskList(data.name);
                taskManager.addList(taskList);
                let ar = data.data.data;
                for (let i = 0; i < ar.length; i++) {
                    let newTask = new Task(ar[i].name, ar[i].description, ar[i].done, ar[i].date, ar[i].lvl);
                    taskList === null || taskList === void 0 ? void 0 : taskList.addTask(newTask);
                    console.log(newTask);
                }
                updateListUI();
            }
            catch (error) {
                console.error(`[auth]: ${error.message}`);
            }
        });
    }
});
let theme = true;
window.switchTheme = function () {
    const body = document.querySelector("body");
    theme ? body.classList.add("dark") : body.classList.remove("dark");
    theme = !theme;
};
//# sourceMappingURL=index.js.map