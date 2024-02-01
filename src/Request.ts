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
    //Отправка запроса на сервер
    async response(path: string, data: object){
        const response = await fetch(path, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        if (!response.ok)
            throw new Error(`[response]: HTTP Error (${response.status})`);
        else{
            const data = await response.json();
            data.message && this.UI.notification(data.message, data.status);
            return data;
        }
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
            const body = {
                login: this.login,
                password: this.password
            }
            const data = await this.response('/api/auth', body);
            if(data.status === "success"){
                const hide = document.querySelector(".modal") as HTMLDivElement;
                hide.style.display = "none";
                this.getTaskListList();
            }
        } catch (error: any) {
            console.error(`[auth]: ${error.message}`);
        }
    }
    //Сохранение списка задач
    async saveTaskList() {
        try{
            const body = {
                login: this.login,
                password: this.password,
                taskList: this.UI.getTaskList()?.name,
                data: {"data": this.UI.getTaskList()?.getTasks()}
            }
            await this.response('/api/saveTaskList', body);
            this.UI.setTask(undefined);
            this.UI.updateTaskUI();
            this.UI.updateListUI();
        } catch (error: any) {
            console.error(`[saveTaskList]: ${error.message}`);
        }
    }
    //Получение списка списков задач
    async getTaskListList() {
        try{
            const body = {
                login: this.login,
                password: this.password
            }
            const data = await this.response('/api/getTaskListList', body);
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
            const body = {
                taskList: name,
                login: this.login,
                password: this.password
            }
            const data = await this.response('/api/getTaskList', body);
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