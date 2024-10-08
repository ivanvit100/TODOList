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
const { ipcRenderer } = require('electron');
export class Request {
    constructor(UI) {
        this.login = "";
        this.password = "";
        this.port = "";
        this.UI = UI;
        ipcRenderer.on('config', (event, data) => {
            this.port = data.port;
            ipcRenderer.send('set-cookie', { url: `http://127.0.0.1:${this.port}`, name: 'login', value: 'value' });
            if (data["color-date-alert"]) {
                let link = document.createElement('link');
                link.rel = 'stylesheet';
                link.href = './css/color-date-alert.css';
                document.head.appendChild(link);
            }
            if (data.theme === "dark")
                document.body.classList.add("dark");
            this.check();
            this.UI.setLang(data.lang);
            this.UI.order = data["sort-order"];
            document.getElementById('openMenu').addEventListener('click', () => {
                ipcRenderer.send('toggle-menu');
            });
        });
    }
    response(path, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield fetch(`http://127.0.0.1:${this.port}${path}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });
            if (!response.ok)
                throw new Error(`[response]: HTTP Error (${response.status})`);
            else {
                const data = yield response.json();
                typeof data.message == "string" && this.UI.notification(data.message, data.status);
                return data;
            }
        });
    }
    check() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const body = {
                    login: this.login,
                    password: this.password
                };
                const data = yield this.response('/api/auth', body);
                if (data.status === "success") {
                    const hide = document.querySelector(".modal");
                    hide.style.display = "none";
                    this.getTaskListList();
                    this.UI.updateTaskUI();
                }
            }
            catch (e) {
                console.error(`[check]: ${e.message}`);
            }
        });
    }
    auth() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const loginInp = document.querySelector("#modal-login");
                const passwordInp = document.querySelector("#modal-password");
                this.login = loginInp.value.trim();
                this.password = passwordInp.value.trim();
                if (this.login === "" || this.password === "") {
                    this.UI.notification("Заполните поля", "error");
                    throw new Error(`Login or password is empty`);
                }
                else {
                    this.check();
                }
            }
            catch (error) {
                console.error(`[auth]: ${error.message}`);
            }
        });
    }
    saveTaskList() {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            try {
                const body = {
                    taskList: (_a = this.UI.getTaskList()) === null || _a === void 0 ? void 0 : _a.name,
                    data: { "data": (_b = this.UI.getTaskList()) === null || _b === void 0 ? void 0 : _b.getTasks() }
                };
                yield this.response('/api/saveTaskList', body);
                this.UI.setTask(undefined);
                this.UI.updateTaskUI();
                this.UI.updateListUI();
            }
            catch (error) {
                console.error(`[saveTaskList]: ${error.message}`);
            }
        });
    }
    getTaskListList() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const data = yield this.response('/api/getTaskListList', {});
                for (let i = 0; i < data.message.length; i++) {
                    let tl = new TaskList(data.message[i]);
                    this.UI.getTaskManager().addList(tl);
                    this.UI.setTaskList(tl);
                    yield this.getTaskList(data.message[i]);
                }
                this.UI.updateManagerUI();
            }
            catch (error) {
                console.error(`[getTaskListList]: ${error.message}`);
            }
        });
    }
    getTaskList() {
        return __awaiter(this, arguments, void 0, function* (name = "default") {
            var _a;
            try {
                const body = { taskList: name };
                const data = yield this.response('/api/getTaskList', body);
                let ar = data.message.data;
                for (let i = 0; i < ar.length; i++) {
                    let newTask = new Task(ar[i].name, ar[i].description, ar[i].done, ar[i].date, ar[i].lvl);
                    (_a = this.UI.getTaskList()) === null || _a === void 0 ? void 0 : _a.addTask(newTask);
                }
            }
            catch (error) {
                console.error(`[getTaskList]: ${error.message}`);
            }
        });
    }
    deleteList(name) {
        return __awaiter(this, void 0, void 0, function* () {
            const body = {
                taskList: name
            };
            const data = yield this.response('/api/deleteList', body);
            const taskManager = this.UI.getTaskManager();
            const taskList = taskManager.getList(name);
            taskManager.removeList(taskList);
            yield this.UI.setTaskList(undefined);
            this.UI.updateManagerUI();
            this.UI.updateListUI();
            return data.message === "success";
        });
    }
}
//# sourceMappingURL=Request.js.map