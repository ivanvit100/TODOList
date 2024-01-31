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
export class Request {
    constructor(UI) {
        this.login = "";
        this.password = "";
        this.UI = UI;
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
                const response = yield fetch('/api/auth', {
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
                else {
                    const data = yield response.json();
                    this.UI.notification(data.message, data.status);
                    if (data.status === "success") {
                        const hide = document.querySelector(".modal");
                        hide.style.display = "none";
                        this.getTaskListList();
                    }
                }
            }
            catch (error) {
                console.error(`[auth]: ${error.message}`);
            }
        });
    }
    saveTaskList() {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield fetch('/api/saveTaskList', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        login: this.login,
                        password: this.password,
                        taskList: (_a = this.UI.getTaskList()) === null || _a === void 0 ? void 0 : _a.name,
                        data: { "data": (_b = this.UI.getTaskList()) === null || _b === void 0 ? void 0 : _b.getTasks() }
                    })
                });
                const data = yield response.json();
                this.UI.notification(data.message, data.status);
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
                const response = yield fetch('/api/getTaskListList', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        login: this.login,
                        password: this.password
                    })
                });
                const data = yield response.json();
                for (let i = 0; i < data.data.length; i++) {
                    let tl = new TaskList(data.data[i]);
                    this.UI.getTaskManager().addList(tl);
                    this.UI.setTaskList(tl);
                    yield this.getTaskList(data.data[i]);
                }
                this.UI.updateManagerUI();
            }
            catch (error) {
                console.error(`[getTaskListList]: ${error.message}`);
            }
        });
    }
    getTaskList(name = "default") {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield fetch('/api/getTaskList', {
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
                const data = yield response.json();
                let ar = data.data.data;
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
}
//# sourceMappingURL=Request.js.map