import { Task, TaskList, TaskManager } from "./Tasks.js";
document.addEventListener("DOMContentLoaded", () => {
    let taskManager = new TaskManager();
    let taskList = new TaskList("default");
    taskManager.addList(taskList);
    const newTask = document.querySelector("#new-task");
    newTask.addEventListener("click", () => {
        const name = document.querySelector("#task-name");
        const description = document.querySelector("#task-description");
        const task = new Task(name.value, description.value);
        taskList.addTask(task);
        console.log(taskManager.getLists());
    });
});
//# sourceMappingURL=index.js.map