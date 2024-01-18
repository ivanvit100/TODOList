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
        taskUI.innerHTML = `<h2>${task.name}</h2><p>${task.description}</p>`;
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
});
let theme = true;
window.switchTheme = function () {
    const body = document.querySelector("body");
    theme ? body.classList.add("dark") : body.classList.remove("dark");
    theme = !theme;
};
//# sourceMappingURL=index.js.map