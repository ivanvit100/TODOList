import { Task, TaskList } from "./Tasks.js";
import { Interface } from "./Interface.js";
import { Request } from "./Request.js";
document.addEventListener("DOMContentLoaded", () => {
    let UI = new Interface();
    let req = new Request(UI);
    const newTask = document.querySelector("#new-task");
    const newTaskList = document.querySelector("#new-tasklist");
    window.changeTaskList = function (name) {
        UI.setTaskList(UI.getTaskManager().getLists().find((l) => l.name === name));
        if (!UI.getTaskList())
            throw new Error(`[changeTaskList]: TaskList with name ${name} not found`);
        else
            UI.updateListUI();
    };
    window.changeTask = function (name) {
        if (!UI.getTaskList())
            throw new Error(`[changeTask]: TaskList not found`);
        else {
            UI.setTask(UI.getTaskList().getTasks().find((t) => t.name === name));
            UI.updateTaskUI();
        }
    };
    window.deleteTask = function () {
        if (!UI.getTask())
            throw new Error(`[deleteTask]: Task not found`);
        else {
            UI.getTaskList().removeTask(UI.getTask());
            req.saveTaskList();
        }
    };
    newTask.addEventListener("click", () => {
        const name = document.querySelector("#task-name");
        const description = document.querySelector("#task-description");
        const taskN = new Task(name.value, description.value);
        if (!UI.getTaskList())
            throw new Error(`[newTask]: TaskList not found`);
        else {
            UI.getTaskList().addTask(taskN);
            UI.updateListUI();
            req.saveTaskList();
        }
    });
    newTaskList.addEventListener("click", () => {
        const name = document.querySelector("#tasklist-name");
        const taskListN = new TaskList(name.value);
        UI.getTaskManager().addList(taskListN);
        UI.updateManagerUI();
        req.saveTaskList();
    });
    const modal = document.querySelector("#modal-enter");
    modal.addEventListener("click", () => req.auth());
});
//# sourceMappingURL=index.js.map