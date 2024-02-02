import { TaskManager } from "./Tasks.js";
export class Interface {
    constructor() {
        this.taskManager = new TaskManager();
        this.taskList = undefined;
        this.task = undefined;
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
            throw new Error(`[updateListUI]: TaskList not found`);
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
                        <span class="inner-header-title">Просмотр задачи</span>
                    </div>
                    <p class="task-description">Выберите задачу для просмотра деталей</p>
                </div>
            </div>`;
            console.error(`[updateTaskUI]: Task not found`);
        }
        else {
            const { formattedDate, date } = this.getDate(this.task);
            const dateABS = Math.abs(date.getTime() - new Date().getTime()) / (1000 * 3600 * 24);
            taskUI.innerHTML = `<div class="task-view">
                <div class="inner-header ${this.task.done ? "done" : ""}
                ${dateABS < 7 ? "expired" : dateABS < 31 ? "date" : ""}" 
                id="task-title">
                    <span class="inner-header-title">${this.task.name}</span>
                </div>
                <p class="task-description">${this.task.description}</p>
            </div>
            <div class="task-bottom">
                <div class="task-icons">
                    <button onclick="done()" class="task-icon"><img src="./public/icons/done.png" alt="Отметить"></button>
                    <button onclick="editTask()" class="task-icon"><img src="./public/icons/edit.png" alt="Редактировать"></button>
                    <button onclick="deleteTask()" class="task-icon"><img src="./public/icons/delete.png" alt="Удалить"></button>
                </div>
                <div class="task-details">
                    <span class="task-importance">Уровень важности: ${this.task.lvl}</span>
                    <span class="task-deadline">Срок выполнения: ${formattedDate}</span>
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
        const dateABS = Math.abs(date.getTime() - new Date().getTime()) / (1000 * 3600 * 24);
        taskUI.innerHTML = `<div class="task-view">
                <div class="inner-header done" id="task-title">
                    <span class="inner-header-title">Редактирование задачи <b>${this.task.name}</b></span>
                </div>
                <input type="text" id="task-name-edit" value="${this.task.name}">
                <textarea id="task-description-edit"></textarea>
                <input type="number" id="task-lvl-edit" value="${this.task.lvl}">
                <input type="date" id="task-date-edit" value="${formattedDate}">
            </div>
            <div class="task-bottom">
                <div class="task-icons">
                    <button onclick="editTask()" class="task-icon"><img src="./public/icons/edit.png" alt="Сохранить"></button>
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
Interface.noDate = "Бессрочно";
let theme = true;
window.switchTheme = function () {
    const body = document.querySelector("body");
    theme ? body.classList.add("dark") : body.classList.remove("dark");
    theme = !theme;
};
//# sourceMappingURL=Interface.js.map