import { Task, TaskList } from "./Tasks.js";
import { Interface } from "./Interface.js";
import { Request } from "./Request.js";

document.addEventListener("DOMContentLoaded", () => {
  //Запуск приложения
  let UI = new Interface();
  let req = new Request(UI);
  const newTask = document.querySelector("#new-task") as HTMLButtonElement;
  const newTaskList = document.querySelector("#new-tasklist") as HTMLButtonElement;

  //Добавление функций в глобальную область видимости
  //Предназначены для вызова из HTML
  (window as any).changeTaskList = function (name: string) {
    //Смена списка задач
    UI.setTaskList(UI.getTaskManager().getLists().find((l) => l.name === name));
    if (!UI.getTaskList())
      throw new Error(`[changeTaskList]: TaskList with name ${name} not found`);
    else
    UI.updateListUI();
  };
  (window as any).changeTask = function (name: string) {
    //Смена задачи
    if (!UI.getTaskList()) throw new Error(`[changeTask]: TaskList not found`);
    else{
      UI.setTask(UI.getTaskList()!.getTasks().find((t) => t.name === name));
      UI.updateTaskUI();
    }
  };
  (window as any).deleteTask = function () {
    //Удаление задачи
    if (!UI.getTask()) throw new Error(`[deleteTask]: Task not found`);
    else{
      UI.getTaskList()!.removeTask(UI.getTask()!);
      req.saveTaskList();
    }
  };

  newTask.addEventListener("click", () => {
    //Добаваление новой задачи
    const name = document.querySelector("#task-name") as HTMLInputElement;
    const description = document.querySelector("#task-description") as HTMLInputElement;
    const taskN = new Task(name.value, description.value);
    if (!UI.getTaskList()) throw new Error(`[newTask]: TaskList not found`);
    else{
      UI.getTaskList()!.addTask(taskN);
      UI.updateListUI();
      req.saveTaskList();
    }
  });
  newTaskList.addEventListener("click", () => {
    //Добаваление нвого списка задач
    const name = document.querySelector("#tasklist-name") as HTMLInputElement;
    const taskListN = new TaskList(name.value);
    UI.getTaskManager()!.addList(taskListN);
    UI.updateManagerUI();
    req.saveTaskList();
  });

  const modal = document.querySelector("#modal-enter") as HTMLButtonElement;
  modal.addEventListener("click", () => req.auth());
});
