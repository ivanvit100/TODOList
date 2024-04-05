// Description: File with classes and methods for working with the interface
// This file is part of the "Todo" module for "Skizo" project
// Author: ivanvit100 @ GitHub
// Licence: MIT

import { Task, TaskList, TaskManager } from "./Tasks.js";

export class Interface {
    private task: Task | undefined;
    private taskList: TaskList | undefined;
    private taskManager: TaskManager;
    private static noDate: string;
    private lang: Record<string, string> = {};
    constructor() {
        this.taskManager = new TaskManager();
        this.taskList = undefined;
        this.task = undefined;
    }
    // Function for setting the language of the interface
    // Language objects and choosen language are stored on server
    // Input: lang - the object with the language constants
    // Output: none
    setLang(lang: Record<string, string>){
        this.lang = lang;
        document.querySelector("#manager-title")!.textContent = lang["taskManager"];
        document.querySelector("#list-title")!.textContent = lang["taskList"];
        document.querySelector("#task-title")!.textContent = lang["taskView"];
        document.querySelector(".task-description")!.textContent = lang["taskViewDescription"];
        (document.querySelector("#tasklist-name") as HTMLInputElement).placeholder = lang["createListPlaceholder"];
        (document.querySelector("#task-name") as HTMLInputElement).placeholder = lang["createTaskPlaceholder"];
        (document.querySelector("#task-description") as HTMLInputElement).placeholder = lang["descriptionPlaceholder"];
        (document.querySelector(".list-icon img") as HTMLImageElement).alt = lang["deleteAltText"];
        try{
            document.querySelector(".modal-title")!.textContent = lang["modalTitle"];
            document.querySelector("#modal-enter")!.textContent = lang["modalEnter"];
            (document.querySelector("#modal-login") as HTMLInputElement).placeholder = lang["login"];
            (document.querySelector("#modal-password") as HTMLInputElement).placeholder = lang["password"];
        } catch(e){
            console.warn(`[setLang]: Modal not found`);
        }
    }
    // Function for getting the due date of the task
    // Input: task - the task for which you want to get the date
    // Output: formattedDate - the date in the format "dd.mm.yyyy"
    //         date - the date in the Date format
    //         If the task is not found, an error is thrown
    //         If the date is not set, the "noDate" constant is returned
    // The function is necessary in order to display the date correctly in 
    // the interface, so it is placed in the Interface class, not the Task class
    getDate(task: Task){
        if(!task) throw new Error(`[getDate]: Task not found`);
        const date = new Date(task.date as unknown as string);
        let formattedDate = Interface.noDate;
        if(date && date.getTime()){
            const day = date.getDate();
            const month = date.getMonth() + 1;
            const year = date.getFullYear();
            formattedDate = `${day}.${month}.${year}`;
        }
        return {formattedDate, date};
    }
    // Function for send notification about operation state
    // Input: message - the message to be displayed
    //        type - the type of the message (info, error, success)
    // Output: none
    notification(message: string, type: string = "info") {
        console.log(`[${type}]: ${message}`);
        const notification = document.createElement('div');
        notification.classList.add('notification-msg', type);
        notification.textContent = message;
        document.body.appendChild(notification);
        setTimeout(() => {
            notification.remove();
        }, 2000);
    }
    // Function for updating the interface of the task manager
    // This method affects the column with the TaskLists output 
    // (left side for desktop interface)
    // Input: none
    // Output: none
    updateManagerUI() {
        const managerUI = document.querySelector("#manager") as HTMLUListElement;
        managerUI.innerHTML = "";
        for (let taskList of this.taskManager.getLists())
            managerUI.innerHTML += `<li><button onclick="changeTaskList('${
                taskList.name
            }')">${taskList.name} 
            <span class="notification">${
                taskList.getTasks().length
            }</span></button></li>`;
    }
    // Function for updating the interface of the task list
    // This method affects the column with the Tasks output 
    // (center column for desktop interface)
    // Input: none
    // Output: none
    updateListUI() {
        const listUI = document.querySelector("#list") as HTMLUListElement;
        listUI.innerHTML = "";
        if (!this.taskList) throw new Error(`[updateListUI]: TaskList not found`);
        else{
            for (let task of this.taskList!.getTasks()){
                const {date} = this.getDate(task);
                const dateABS = Math.abs(date.getTime() - new Date().getTime()) / (1000 * 3600 * 24);
                listUI.innerHTML += `<li><button onclick="changeTask('${task.name}')">
                    ${task.name} <span class="notification ${task.done ? "done" : ""}
                    ${dateABS < 7 ? "expired" : dateABS < 31 ? "date" : ""}">${task.lvl}</span>
                </button></li>`;
            }
            const title = document.querySelector("#list-name") as HTMLSpanElement;
            title.innerText = this.taskList.name;
            this.updateManagerUI();
        }
    }
    // Function for updating the interface of the task
    // This method affects the column with the Task description output 
    // (right side for desktop interface)
    // Input: none
    // Output: none
    updateTaskUI() {
        const taskUI = document.querySelector("#task") as HTMLDivElement;
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
        }else{
            const {formattedDate, date} = this.getDate(this.task);
            const dateABS = Math.abs(date.getTime() - new Date().getTime()) / (1000 * 3600 * 24);
            const regex = new RegExp("https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$");
            taskUI.innerHTML = `<div class="task-view">
                <div class="inner-header ${this.task.done ? "done" : ""}
                ${dateABS < 7 ? "expired" : dateABS <  31 ? "date" : ""}" 
                id="task-title">
                    <span class="inner-header-title">${this.task!.name}</span>
                </div>
                <p class="task-description">${regex.test(this.task!.description) ? 
                    "<iframe height='1000'  width='800' src='" + this.task!.description + "'></iframe>": 
                    this.task!.description}</p>
            </div>
            <div class="task-bottom">
                <div class="task-icons">
                    <button onclick="done()" class="task-icon"><img src="./public/icons/done.png" alt="Отметить"></button>
                    <button onclick="editTask()" class="task-icon"><img src="./public/icons/edit.png" alt="Редактировать"></button>
                    <button onclick="deleteTask()" class="task-icon"><img src="./public/icons/delete.png" alt="Удалить"></button>
                </div>
                <div class="task-details">
                    <span class="task-importance">${this.lang["lvl"]}: ${this.task!.lvl}</span>
                    <span class="task-deadline">${this.lang["date"]}: ${formattedDate}</span>
                </div>
                <div class="task-tag">
                    <span class="tag">${this.taskList!.name}</span>
                </div>
            </div>`;
        }
    }
    // Function for updating the interface of the task
    // This method adds a task editing interface 
    // Input: none
    // Output: none
    editTaskUI() {
        //Редактирование задачи
        const taskUI = document.querySelector("#task") as HTMLDivElement;
        const {formattedDate, date} = this.getDate(this.task!);
        const dateABS = Math.abs(date.getTime() - new Date().getTime()) / (1000 * 3600 * 24);
        taskUI.innerHTML = `<div class="task-view">
                <div class="inner-header done" id="task-title">
                    <span class="inner-header-title">${this.lang["editTask"]} <b>${this.task!.name}</b></span>
                </div>
                <input type="text" id="task-name-edit" value="${this.task!.name}">
                <textarea id="task-description-edit"></textarea>
                <input type="number" id="task-lvl-edit" value="${this.task!.lvl}">
                <input type="date" id="task-date-edit" value="${formattedDate}">
            </div>
            <div class="task-bottom">
                <div class="task-icons">
                    <button onclick="editTask()" class="task-icon"><img src="./public/icons/edit.png" alt="Сохранить"></button>
                </div>
                <div class="task-tag">
                    <span class="tag">${this.taskList!.name}</span>
                </div>
            </div>`;
        const description = document.querySelector("#task-description-edit") as HTMLTextAreaElement;
        description.innerText = this.task!.description;
    }
    // Function for getting the active task
    // Input: none
    // Output: active Task object
    getTask(){
        return this.task;
    }
    // Function for getting the active task list
    // Input: none
    // Output: active TaskList object
    getTaskList(){
        return this.taskList;
    }
    // Function for getting the active task manager
    // Input: none
    // Output: active TaskManager object
    getTaskManager(){
        return this.taskManager;
    }
    // Function for setting new task as active
    // Input: task - the Task to be set as active
    // Output: none
    setTask(task: Task | undefined){
        this.task = task;
    }
    // Function for setting new task list as active
    // Input: taskList - the TaskList to be set as active
    // Output: none
    setTaskList(taskList: TaskList | undefined){
        this.taskList = taskList;
    }
}

// Function for changing theme of the interface
// Calling from the window object by clicking button
// Input: none
// Output: none
let theme = true;
(window as any).switchTheme = function () {
    //Смена темы
    const body = document.querySelector("body") as HTMLBodyElement;
    theme ? body.classList.add("dark") : body.classList.remove("dark");
    theme = !theme;
}