import { Task, TaskList, TaskManager } from "./Tasks.js";

export class Interface {
    private task: Task | undefined;
    private taskList: TaskList | undefined;
    private taskManager: TaskManager;
    constructor() {
        this.taskManager = new TaskManager();
        this.taskList = undefined;
        this.task = undefined;
    }
    notification(message: string, type: string = "info") {
        //Вывод уведомления
        const notification = document.createElement('div');
        notification.classList.add('notification-msg', type);
        notification.textContent = message;
        document.body.appendChild(notification);
        setTimeout(() => {
            notification.remove();
        }, 2000);
    }
    updateManagerUI() {
        //Обновление списка списков задач (левая часть)
        const managerUI = document.querySelector("#manager") as HTMLUListElement;
        managerUI.innerHTML = "";
        for (let taskList of this.taskManager.getLists())
            managerUI.innerHTML += `<li><button onclick="changeTaskList('${
                taskList.name
            }')">${taskList.name} <span class="notification">${
                taskList.getTasks().length
            }</span></button></li>`;
    }
    updateListUI() {
        //Обновление списка задач (центральная часть)
        const listUI = document.querySelector("#list") as HTMLUListElement;
        listUI.innerHTML = "";
        if (!this.taskList) throw new Error(`[updateListUI]: TaskList not found`);
        else{
            for (let task of this.taskList!.getTasks())
                listUI.innerHTML += `<li><button onclick="changeTask('${task.name}')">
                    ${task.name} <span class="notification">${task.lvl}</span>
                </button></li>`;
            const title = document.querySelector("#list-name") as HTMLSpanElement;
            title.innerText = this.taskList.name;
            this.updateManagerUI();
        }
    }
    updateTaskUI() {
        //Обновление информации о задаче (правая часть)
        const taskUI = document.querySelector("#task") as HTMLDivElement;
        if (!this.taskList || !this.task) throw new Error(`[updateTaskUI]: Task not found`);
        else{
            taskUI.innerHTML = `<div class="task-view">
                <div class="inner-header" id="task-title">
                    <span class="inner-header-title">${this.task!.name}</span>
                </div>
                <p class="task-description">${this.task!.description}</p>
            </div>
            <div class="task-bottom">
                <div class="task-icons">
                    <button onclick="" class="task-icon"><img src="./pub/icons/edit.png" alt="Редактировать"></button>
                    <button onclick="deleteTask()" class="task-icon"><img src="./pub/icons/delete.png" alt="Удалить"></button>
                </div>
                <div class="task-details">
                    <span class="task-importance">Уровень важности: ${this.task!.lvl}</span>
                    <span class="task-deadline">Срок выполнения: ${this.task!.date}</span>
                </div>
                <div class="task-tag">
                    <span class="tag">${this.taskList!.name}</span>
                </div>
            </div>`;
        }
    }
    getTask(){
        return this.task;
    }
    getTaskList(){
        return this.taskList;
    }
    getTaskManager(){
        return this.taskManager;
    }
    setTask(task: Task | undefined){
        this.task = task;
    }
    setTaskList(taskList: TaskList | undefined){
        this.taskList = taskList;
    }
}

let theme = true;
(window as any).switchTheme = function () {
    //Смена темы
    const body = document.querySelector("body") as HTMLBodyElement;
    theme ? body.classList.add("dark") : body.classList.remove("dark");
    theme = !theme;
}