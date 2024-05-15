// Description: Main web script for the "Todo" module
// This file is part of the "Todo app" project
// Author: ivanvit100 @ GitHub
// Licence: MIT

import { Task, TaskList } from "./Tasks.js";
import { Interface } from "./Interface.js";
import { Request } from "./Request.js";

document.addEventListener("DOMContentLoaded", () => {
  // Start application
  // Initialization of the main classes 
  // and selection of the main elements
  // Request config file from server to 
  // load the necessary styles and scripts
  let UI = new Interface();
  let req = new Request(UI);
  const newTask = document.querySelector("#new-task") as HTMLButtonElement;
  const newTaskList = document.querySelector("#new-tasklist") as HTMLButtonElement;
  
  // Function what called when user click on "edit" button
  // This function open interface for editing task
  // or save changes if task already edited
  // Input: nameTask - name of the task
  // Output: none
  (window as any).editTask = function (nameTask: string) {
    let name = document.querySelector("#task-name-edit") as HTMLInputElement;
    let description = document.querySelector("#task-description-edit") as HTMLTextAreaElement;
    let lvl = document.querySelector("#task-lvl-edit") as HTMLInputElement;
    let date = document.querySelector("#task-date-edit") as HTMLInputElement;
    if (description === null)
      UI.editTaskUI();
    else{
      try{
        UI.getTask()!.name = name.value;
        UI.getTask()!.description = description.value;
        UI.getTask()!.lvl = parseInt(lvl.value);
        if (date.value.trim() !== "") {
          const [day, month, year] = date.value.split(".");
          UI.getTask()!.date = new Date(`${year}-${month}-${day}`);
        }
        UI.updateTaskUI();
        req.saveTaskList();
      } catch (error: any) {
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

  // Function what called when user click on different TaskList in TaskManager
  // This function change current TaskList and update UI
  // Input: name - name of the TaskList
  // Output: none
  (window as any).changeTaskList = function (name: string) {
    UI.setTaskList(UI.getTaskManager().getLists().find((l) => l.name === name));
    if (!UI.getTaskList())
      throw new Error(`[changeTaskList]: TaskList with name ${name} not found`);
    else UI.updateListUI();
  };

  // Function what called when user click on different Task in TaskList
  // This function change current Task and update UI
  // Input: name - name of the Task
  // Output: none
  (window as any).changeTask = function (name: string) {
    if (!UI.getTaskList()) throw new Error(`[changeTask]: TaskList not found`);
    else{
      UI.setTask(UI.getTaskList()!.getTasks().find((t) => t.name === name));
      UI.updateTaskUI();
    }
  };

  // Function what called when user click on "delete" button in Task UI
  // This function delete current Task and update UI
  // Input: none
  // Output: none
  (window as any).deleteTask = async function () {
    if (!UI.getTask()) throw new Error(`[deleteTask]: Task not found`);
    else{
      UI.getTaskList()!.removeTask(UI.getTask()!);
      req.saveTaskList();
    }
  };

  // Function what called when user click on "delete" button in TaskList UI
  // This function delete current TaskList and update UI
  // Input: none
  // Output: none
  (window as any).deleteList = async function () {
    if (!UI.getTaskList()) throw new Error(`[deleteList]: List not found`);
    else{
      const name = UI.getTaskList()!.name;
      await req.deleteList(name) && UI.getTaskManager().removeList(UI.getTaskList()!);
    }
  };

  // Function what called when user click on "done" button in Task UI
  // This function mark current Task as done (or not) and update UI
  // Input: none
  // Output: none
  (window as any).done = async function () {
    if (!UI.getTask()) throw new Error(`[done]: Task not found`);
    else{
      UI.getTask()!.doneTask();
      req.saveTaskList();
    }
  };

  // Function what called when user create new Task
  // This function create new Task and update UI
  // Input: none
  // Output: none
  newTask.addEventListener("click", () => {
    if(UI.getTaskList() === undefined) return;
    const name = document.querySelector("#task-name") as HTMLInputElement;
    const description = document.querySelector("#task-description") as HTMLInputElement;
    const lvl = document.querySelector("#task-lvl") as HTMLInputElement;
    const date = document.querySelector("#task-date") as HTMLInputElement;
    let dateVal : Date | undefined = undefined;
    try{
      if (date.value.trim() !== "") {
        const [day, month, year] = date.value.split(".");
        dateVal = new Date(`${year}-${month}-${day}`);
        if (dateVal.toString() === "Invalid Date") {
          UI.notification("Неверный формат даты", "error")
          throw new Error(`[newTask]: Invalid Date`);
        }
      }
    } catch (error: any) {
      UI.notification("Неверный формат даты", "error")
      throw new Error(`[newTask]: ${error.message}`);
    }
    const lvlVal = parseInt(lvl.value);
    if (isNaN(lvlVal) && lvl.value.trim() !== "") {
      UI.notification("Уровень приоритета должен быть числом", "error")
      throw new Error(`[newTask]: lvl is NaN`);
    }
    const taskN = new Task(name.value, description.value, false, dateVal, isNaN(lvlVal) ? 0 : lvlVal);
    if (!UI.getTaskList()) throw new Error(`[newTask]: TaskList not found`);
    else{
      UI.getTaskList()!.addTask(taskN);
      UI.updateListUI();
      req.saveTaskList();
    }
    name.value = "";
    description.value = "";
    lvl.value = "";
    date.value = "";
  });

  // Function what called when user create new TaskList
  // This function create new TaskList and update UI
  // Input: none
  // Output: none
  newTaskList.addEventListener("click", () => {
    const name = document.querySelector("#tasklist-name") as HTMLInputElement;
    const taskListN = new TaskList(name.value);
    name.value = "";
    UI.getTaskManager()!.addList(taskListN);
    UI.updateManagerUI();
    UI.setTaskList(taskListN);
    UI.updateListUI();
    req.saveTaskList();
  });

  // Function what called when user click on "enter" button in modal window
  // This function send request to server for authentication
  // and load TaskLists from server 
  // Input: none
  // Output: none
  const modal = document.querySelector("#modal-enter") as HTMLButtonElement;
  modal.addEventListener("click", () => req.auth());
});
