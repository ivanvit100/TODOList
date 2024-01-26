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
    let taskList;
    let task;
    const newTask = document.querySelector("#new-task");
    const newTaskList = document.querySelector("#new-tasklist");
    let login;
    let password;
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
        else {
            for (let task of taskList.getTasks())
                listUI.innerHTML += `<li><button onclick="changeTask('${task.name}')">${task.name} <span class="notification">${task.lvl}</span></button></li>`;
            const title = document.querySelector("#list-name");
            title.innerText = taskList.name;
            updateManagerUI();
        }
    }
    function updateTaskUI() {
        const taskUI = document.querySelector("#task");
        if (!taskList)
            throw new Error(`[updateTaskUI]: Task not found`);
        else {
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
    }
    window.changeTaskList = function (name) {
        taskList = taskManager.getLists().find((l) => l.name === name);
        if (!taskList)
            throw new Error(`[changeTaskList]: TaskList with name ${name} not found`);
        else
            updateListUI();
    };
    window.changeTask = function (name) {
        if (!taskList)
            throw new Error(`[changeTask]: TaskList not found`);
        else {
            task = taskList.getTasks().find((t) => t.name === name);
            updateTaskUI();
        }
    };
    newTask.addEventListener("click", () => {
        const name = document.querySelector("#task-name");
        const description = document.querySelector("#task-description");
        const taskN = new Task(name.value, description.value);
        if (!taskList)
            throw new Error(`[newTask]: TaskList not found`);
        else {
            taskList.addTask(taskN);
            updateListUI();
        }
    });
    newTaskList.addEventListener("click", () => {
        const name = document.querySelector("#tasklist-name");
        const taskListN = new TaskList(name.value);
        taskManager.addList(taskListN);
        updateManagerUI();
    });
    function notification(message, type = "info") {
        const notification = document.createElement('div');
        notification.classList.add('notification-msg', type);
        notification.textContent = message;
        document.body.appendChild(notification);
        setTimeout(() => {
            notification.remove();
        }, 2000);
    }
    const modal = document.querySelector("#modal-enter");
    modal.addEventListener("click", () => auth());
    function auth() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const loginInp = document.querySelector("#modal-login");
                const passwordInp = document.querySelector("#modal-password");
                login = loginInp.value.trim();
                password = passwordInp.value.trim();
                if (login === "" || password === "") {
                    notification("Заполните поля", "error");
                    throw new Error(`Login or password is empty`);
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
                else {
                    const data = yield response.json();
                    notification(data.message, data.status);
                    if (data.status === "success") {
                        const hide = document.querySelector(".modal");
                        hide.style.display = "none";
                        getTaskListList();
                    }
                }
            }
            catch (error) {
                console.error(`[auth]: ${error.message}`);
            }
        });
    }
    function getTaskListList() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield fetch('https://vigilant-carnival-7xg7w7jp6v73rww5-5000.app.github.dev/api/getTaskListList', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        login: login,
                        password: password
                    })
                });
                const data = yield response.json();
                for (let i = 0; i < data.data.length; i++) {
                    taskList = new TaskList(data.data[i]);
                    taskManager.addList(taskList);
                    yield getTaskList(data.data[i]);
                }
                updateManagerUI();
            }
            catch (error) {
                console.error(`[getTaskListList]: ${error.message}`);
            }
        });
    }
    function getTaskList(name = "default") {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield fetch('https://vigilant-carnival-7xg7w7jp6v73rww5-5000.app.github.dev/api/getTaskList', {
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
                const data = yield response.json();
                let ar = data.data.data;
                console.log(taskList);
                for (let i = 0; i < ar.length; i++) {
                    let newTask = new Task(ar[i].name, ar[i].description, ar[i].done, ar[i].date, ar[i].lvl);
                    taskList === null || taskList === void 0 ? void 0 : taskList.addTask(newTask);
                }
            }
            catch (error) {
                console.error(`[getTaskList]: ${error.message}`);
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