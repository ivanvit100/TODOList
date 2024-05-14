import { TaskManager } from "./Tasks.js";
export class Interface {
    constructor() {
        this.lang = {};
        this.taskManager = new TaskManager();
        this.taskList = undefined;
        this.task = undefined;
    }
    setLang(lang) {
        this.lang = lang;
        document.querySelector("#manager-title").textContent = lang["taskManager"];
        document.querySelector("#list-title").textContent = lang["taskList"];
        document.querySelector("#task-title").textContent = lang["taskView"];
        document.querySelector(".task-description").textContent = lang["taskViewDescription"];
        document.querySelector("#tasklist-name").placeholder = lang["createListPlaceholder"];
        document.querySelector("#task-name").placeholder = lang["createTaskPlaceholder"];
        document.querySelector("#task-description").placeholder = lang["descriptionPlaceholder"];
        document.querySelector(".list-icon img").alt = lang["deleteAltText"];
        try {
            document.querySelector(".modal-title").textContent = lang["modalTitle"];
            document.querySelector("#modal-enter").textContent = lang["modalEnter"];
            document.querySelector("#modal-login").placeholder = lang["login"];
            document.querySelector("#modal-password").placeholder = lang["password"];
        }
        catch (e) {
            console.warn(`[setLang]: Modal not found`);
        }
    }
    getDate(task) {
        if (!task)
            throw new Error(`[getDate]: Task not found`);
        const date = new Date(task.date);
        let formattedDate = Interface.noDate;
        if (date && date.getTime()) {
            const day = date.getDate();
            const month = date.getMonth() + 1;
            const year = date.getFullYear();
            formattedDate = `${day}.${month}.${year}`;
        }
        return { formattedDate, date };
    }
    notification(message, type = "info") {
        console.log(`[${type}]: ${message}`);
        const notification = document.createElement('div');
        notification.classList.add('notification-msg', type);
        notification.textContent = message;
        document.body.appendChild(notification);
        setTimeout(() => {
            notification.remove();
        }, 2000);
    }
    updateManagerUI() {
        const managerUI = document.querySelector("#manager");
        managerUI.innerHTML = "";
        for (let taskList of this.taskManager.getLists())
            managerUI.innerHTML += `<li><button onclick="changeTaskList('${taskList.name}')">${taskList.name} 
            <span class="notification">${taskList.getTasks().length}</span></button></li>`;
    }
    updateListUI() {
        const listUI = document.querySelector("#list");
        listUI.innerHTML = "";
        if (!this.taskList)
            document.querySelector("#list-name").innerText = "";
        else {
            for (let task of this.taskList.getTasks()) {
                const { date } = this.getDate(task);
                const dateABS = Math.abs(date.getTime() - new Date().getTime()) / (1000 * 3600 * 24);
                listUI.innerHTML += `<li><button onclick="changeTask('${task.name}')">
                    ${task.name} <span class="notification ${task.done ? "done" : ""}
                    ${dateABS < 7 ? "expired" : dateABS < 31 ? "date" : ""}">${task.lvl}</span>
                </button></li>`;
            }
            const title = document.querySelector("#list-name");
            title.innerText = this.taskList.name;
            this.updateManagerUI();
        }
    }
    updateTaskUI() {
        const taskUI = document.querySelector("#task");
        if (!this.taskList || !this.task) {
            taskUI.innerHTML = `
            <div class="task-viewer">
                <div id="task">
                    <div class="task-view">
                        <div class="inner-header" id="task-title">
                        <span class="inner-header-title">${this.lang["taskView"]}</span>
                    </div>
                    <p class="task-description">${this.lang["taskViewDescription"]}</p>
                </div>
            </div>`;
            console.error(`[updateTaskUI]: Task not found`);
        }
        else {
            const { formattedDate, date } = this.getDate(this.task);
            const dateABS = Math.abs(date.getTime() - new Date().getTime()) / (1000 * 3600 * 24);
            const regex = new RegExp("https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$");
            taskUI.innerHTML = `<div class="task-view">
                <div class="inner-header ${this.task.done ? "done" : ""}
                ${dateABS < 7 ? "expired" : dateABS < 31 ? "date" : ""}" 
                id="task-title">
                    <span class="inner-header-title">${this.task.name}</span>
                </div>
                <p class="task-description">${regex.test(this.task.description) ?
                "<iframe height='1000'  width='800' src='" + this.task.description + "'></iframe>" :
                this.task.description}</p>
            </div>
            <div class="task-bottom">
                <div class="task-icons">
                    <button onclick="done()" class="task-icon"><img src="./icons/done.png" alt="Отметить"></button>
                    <button onclick="editTask()" class="task-icon"><img src="./icons/edit.png" alt="Редактировать"></button>
                    <button onclick="deleteTask()" class="task-icon"><img src="./icons/delete.png" alt="Удалить"></button>
                </div>
                <div class="task-details">
                    <span class="task-importance">${this.lang["lvl"]}: ${this.task.lvl}</span>
                    <span class="task-deadline">${this.lang["date"]}: ${formattedDate}</span>
                </div>
                <div class="task-tag">
                    <span class="tag">${this.taskList.name}</span>
                </div>
            </div>`;
        }
    }
    editTaskUI() {
        const taskUI = document.querySelector("#task");
        const { formattedDate, date } = this.getDate(this.task);
        taskUI.innerHTML = `<div class="task-view">
                <div class="inner-header done" id="task-title">
                    <span class="inner-header-title">${this.lang["editTask"]} <b>${this.task.name}</b></span>
                </div>
                <input type="text" id="task-name-edit" value="${this.task.name}">
                <textarea id="task-description-edit"></textarea>
                <input type="number" id="task-lvl-edit" value="${this.task.lvl}">
                <input type="date" id="task-date-edit" value="${formattedDate}">
            </div>
            <div class="task-bottom">
                <div class="task-icons">
                    <button onclick="editTask()" class="task-icon"><img src="./icons/edit.png" alt="Сохранить"></button>
                </div>
                <div class="task-tag">
                    <span class="tag">${this.taskList.name}</span>
                </div>
            </div>`;
        const description = document.querySelector("#task-description-edit");
        description.innerText = this.task.description;
    }
    getTask() {
        return this.task;
    }
    getTaskList() {
        return this.taskList;
    }
    getTaskManager() {
        return this.taskManager;
    }
    setTask(task) {
        this.task = task;
    }
    setTaskList(taskList) {
        this.taskList = taskList;
    }
}
let theme = true;
window.switchTheme = function () {
    const body = document.querySelector("body");
    theme ? body.classList.add("dark") : body.classList.remove("dark");
    theme = !theme;
};
//# sourceMappingURL=Interface.js.map