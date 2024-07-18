"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const { ipcRenderer } = require('electron');
class Settings {
    constructor() {
        this.port = "";
        this.login = "";
        this.password = "";
        this.lang = {};
        ipcRenderer.on('config', (event, data) => {
            this.port = data.port;
            ipcRenderer.send('set-cookie', { url: `http://127.0.0.1:${this.port}`, name: 'login', value: 'value' });
            this.check();
            this.setLang(data.lang);
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
                typeof data.message == "string" && this.notification(data.message, data.status);
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
                }
                const html = yield this.getSettings();
                document.querySelector("#settings").innerHTML = html;
            }
            catch (e) {
                console.error(`[check]: ${e.message}`);
            }
        });
    }
    setLang(lang) {
        this.lang = lang;
        document.querySelector("#manager-title").textContent = lang["taskManager"];
        document.querySelector("#list-title").textContent = lang["taskList"];
        document.querySelector("#task-title").textContent = lang["taskView"];
        document.querySelector(".task-description").textContent = lang["taskViewDescription"];
        document.querySelector("#tasklist-name").placeholder = lang["createListPlaceholder"];
        document.querySelector("#task-name").placeholder = lang["createTaskPlaceholder"];
        document.querySelector("#task-description").placeholder = lang["descriptionPlaceholder"];
        document.querySelector(".list-icon img").alt = lang["deleteAltText"];
        try {
            document.querySelector(".modal-title").textContent = lang["modalTitle"];
            document.querySelector("#modal-enter").textContent = lang["modalEnter"];
            document.querySelector("#modal-login").placeholder = lang["login"];
            document.querySelector("#modal-password").placeholder = lang["password"];
        }
        catch (e) {
            console.warn(`[setLang]: Modal not found`);
        }
    }
    notification(message, type = "info") {
        console.log(`[${type}]: ${message}`);
        const notification = document.createElement('div');
        notification.classList.add('notification-msg', type);
        notification.textContent = message;
        document.body.appendChild(notification);
        setTimeout(() => {
            notification.remove();
        }, 2000);
    }
    auth() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const loginInp = document.querySelector("#modal-login");
                const passwordInp = document.querySelector("#modal-password");
                this.login = loginInp.value.trim();
                this.password = passwordInp.value.trim();
                if (this.login === "" || this.password === "") {
                    this.notification("Заполните поля", "error");
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
    getSettings() {
        return __awaiter(this, void 0, void 0, function* () {
            const json = (yield this.response('/api/getSettings', {})).message;
            let html = '';
            console.log(json);
            for (let key in json) {
                if (typeof json[key] === 'string')
                    html += `<label for="${key}">${key}</label><input type="text" id="${key}" name="${key}" value="${json[key]}"><br>`;
                else if (typeof json[key] === 'boolean') {
                    let checked = json[key] ? 'checked' : '';
                    html += `<label for="${key}">${key}</label><input type="checkbox" id="${key}" name="${key}" ${checked}><br>`;
                }
            }
            return html;
        });
    }
    saveSettings() {
        return __awaiter(this, void 0, void 0, function* () {
            let data = {};
            document.querySelectorAll('#settings input').forEach((input) => {
                data[input.id] = input.type === 'checkbox' ? input.checked : input.value;
            });
            const ans = yield this.response('/api/setSettings', data);
            this.notification(ans.message, ans.status);
        });
    }
}
document.addEventListener("DOMContentLoaded", () => {
    const settings = new Settings();
    const modal = document.querySelector("#modal-enter");
    modal.addEventListener("click", () => settings.auth());
    window.save = function () {
        return __awaiter(this, void 0, void 0, function* () { settings.saveSettings(); });
    };
});
//# sourceMappingURL=settings.js.map