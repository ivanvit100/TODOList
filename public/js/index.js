var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Task, TaskList } from "./Tasks.js";
import { Interface } from "./Interface.js";
import { Request } from "./Request.js";
document.addEventListener("DOMContentLoaded", () => {
    let UI = new Interface();
    let req = new Request(UI);
    const newTask = document.querySelector("#new-task");
    const newTaskList = document.querySelector("#new-tasklist");
    window.editTask = function (nameTask) {
        let name = document.querySelector("#task-name-edit");
        let description = document.querySelector("#task-description-edit");
        let lvl = document.querySelector("#task-lvl-edit");
        let date = document.querySelector("#task-date-edit");
        if (description === null)
            UI.editTaskUI();
        else {
            try {
                UI.getTask().name = name.value;
                UI.getTask().description = description.value;
                UI.getTask().lvl = parseInt(lvl.value);
                if (date.value.trim() !== "") {
                    const [day, month, year] = date.value.split(".");
                    UI.getTask().date = new Date(`${year}-${month}-${day}`);
                }
                UI.updateTaskUI();
                req.saveTaskList();
            }
            catch (error) {
                UI.notification("Возникла ошибка при редактировании", "error");
                UI.updateListUI();
                throw new Error(`[editTask]: ${error.message}`);
            }
        }
        if (!UI.getTaskList())
            throw new Error(`[changeTaskList]: TaskList with name ${nameTask} not found`);
        else
            UI.updateListUI();
    };
    window.changeTaskList = function (name) {
        UI.setTaskList(UI.getTaskManager().getLists().find((l) => l.name === name));
        if (!UI.getTaskList())
            throw new Error(`[changeTaskList]: TaskList with name ${name} not found`);
        else {
            UI.updateListUI();
            UI.state = 1;
            UI.state_switch();
        }
    };
    window.changeTask = function (name) {
        if (!UI.getTaskList())
            throw new Error(`[changeTask]: TaskList not found`);
        else {
            UI.setTask(UI.getTaskList().getTasks().find((t) => t.name === name));
            UI.updateTaskUI();
            UI.state = 2;
            UI.state_switch();
        }
    };
    window.deleteTask = function () {
        return __awaiter(this, void 0, void 0, function* () {
            if (!UI.getTask())
                throw new Error(`[deleteTask]: Task not found`);
            else {
                UI.getTaskList().removeTask(UI.getTask());
                req.saveTaskList();
            }
        });
    };
    window.deleteList = function () {
        return __awaiter(this, void 0, void 0, function* () {
            if (!UI.getTaskList())
                throw new Error(`[deleteList]: List not found`);
            else {
                const name = UI.getTaskList().name;
                (yield req.deleteList(name)) && UI.getTaskManager().removeList(UI.getTaskList());
            }
        });
    };
    window.done = function () {
        return __awaiter(this, void 0, void 0, function* () {
            if (!UI.getTask())
                throw new Error(`[done]: Task not found`);
            else {
                UI.getTask().doneTask();
                req.saveTaskList();
            }
        });
    };
    window.state_switch = function (mode = 0) {
        UI.state = mode ?
            UI.state === 2 ? 2 : UI.state + 1 :
            UI.state === 0 ? 0 : UI.state - 1;
        UI.state_switch();
    };
    newTask.addEventListener("click", () => {
        if (UI.getTaskList() === undefined)
            return;
        const name = document.querySelector("#task-name");
        const description = document.querySelector("#task-description");
        const lvl = document.querySelector("#task-lvl");
        const date = document.querySelector("#task-date");
        let dateVal = undefined;
        try {
            if (date.value.trim() !== "") {
                const [day, month, year] = date.value.split(".");
                dateVal = new Date(`${year}-${month}-${day}`);
                if (dateVal.toString() === "Invalid Date") {
                    UI.notification("Неверный формат даты", "error");
                    throw new Error(`[newTask]: Invalid Date`);
                }
            }
        }
        catch (error) {
            UI.notification("Неверный формат даты", "error");
            throw new Error(`[newTask]: ${error.message}`);
        }
        const lvlVal = parseInt(lvl.value);
        if (isNaN(lvlVal) && lvl.value.trim() !== "") {
            UI.notification("Уровень приоритета должен быть числом", "error");
            throw new Error(`[newTask]: lvl is NaN`);
        }
        const taskN = new Task(name.value, description.value, false, dateVal, isNaN(lvlVal) ? 0 : lvlVal);
        if (!UI.getTaskList())
            throw new Error(`[newTask]: TaskList not found`);
        else {
            UI.getTaskList().addTask(taskN);
            UI.updateListUI();
            req.saveTaskList();
        }
        name.value = "";
        description.value = "";
        lvl.value = "";
        date.value = "";
    });
    newTaskList.addEventListener("click", () => {
        const name = document.querySelector("#tasklist-name");
        const taskListN = new TaskList(name.value);
        name.value = "";
        UI.getTaskManager().addList(taskListN);
        UI.updateManagerUI();
        UI.setTaskList(taskListN);
        UI.updateListUI();
        req.saveTaskList();
    });
    const modal = document.querySelector("#modal-enter");
    modal.addEventListener("click", () => req.auth());
});
//# sourceMappingURL=index.js.map