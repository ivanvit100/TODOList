import { Task, TaskList } from "./Tasks.js";
import { Interface } from "./Interface.js";

export class Request {
    private login: string;
    private password: string;
    private UI: Interface;
    constructor(UI: Interface) {
        this.login = "";
        this.password = "";
        this.UI = UI;
    }
    //Вход в систему
    async auth() {
        try {
            const loginInp = document.querySelector("#modal-login") as HTMLInputElement;
            const passwordInp = document.querySelector("#modal-password") as HTMLInputElement;
            this.login = loginInp.value.trim();
            this.password = passwordInp.value.trim();
            if(this.login === "" || this.password === ""){
                this.UI.notification("Заполните поля", "error");
                throw new Error(`Login or password is empty`);
            }
            const response = await fetch('/api/auth', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    login: this.login,
                    password: this.password
                })
            });
            if (!response.ok)
                throw new Error(`[auth]: HTTP Error (${response.status})`);
            else{
                const data = await response.json();
                this.UI.notification(data.message, data.status);
                if(data.status === "success"){
                    const hide = document.querySelector(".modal") as HTMLDivElement;
                    hide.style.display = "none";
                    this.getTaskListList();
                }
            }
        } catch (error: any) {
            console.error(`[auth]: ${error.message}`);
        }
    }
    //Сохранение списка задач
    async saveTaskList() {
        try{
            const response = await fetch('/api/saveTaskList', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    login: this.login,
                    password: this.password,
                    taskList: this.UI.getTaskList()?.name,
                    data: {"data": this.UI.getTaskList()?.getTasks()}
                })
            });
            const data = await response.json();
            this.UI.notification(data.message, data.status);
            this.UI.updateTaskUI();
            this.UI.updateListUI();
        } catch (error: any) {
            console.error(`[saveTaskList]: ${error.message}`);
        }
    }
    //Получение списка списков задач
    async getTaskListList() {
        try{
            const response = await fetch('/api/getTaskListList', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    login: this.login,
                    password: this.password
                })
            });
            const data = await response.json();
            for(let i = 0; i < data.data.length; i++){
                let tl = new TaskList(data.data[i]);
                this.UI.getTaskManager().addList(tl);
                this.UI.setTaskList(tl);
                await this.getTaskList(data.data[i]);
            }
            this.UI.updateManagerUI();
        } catch (error: any) {
            console.error(`[getTaskListList]: ${error.message}`);
        }
    }
    //Получение списка задач
    async getTaskList(name: string = "default") {
        try{
            const response = await fetch('/api/getTaskList', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    taskList: name,
                    login: this.login,
                    password: this.password
                })
            });
            const data = await response.json();
            let ar = data.data.data;
            for(let i = 0; i < ar.length; i++){
                let newTask = new Task(ar[i].name, ar[i].description, ar[i].done, ar[i].date, ar[i].lvl);
                this.UI.getTaskList()?.addTask(newTask);
            }
        } catch (error: any) {
            console.error(`[getTaskList]: ${error.message}`);
        }
    }
}