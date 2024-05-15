// Description: File for setup page of the "Todo" module
// This file is part of the "Todo app" project
// Author: ivanvit100 @ GitHub
// Licence: MIT

const { ipcRenderer } = require('electron');

class Settings {
    private port: string = "";
    private login: string = "";
    private password: string = "";
    private lang: Record<string, string> = {};
    constructor() {
        ipcRenderer.on('config', (event: Event, data: {
            "port": string, 
            // 'login': string,
            "color-date-alert": string, 
            "lang": Record<string, string>
        }) => {
            this.port = data.port;
            ipcRenderer.send('set-cookie', { url: `http://127.0.0.1:${this.port}`, name: 'login', value: 'value' });
            // if(data.login){
            //     const hide = document.querySelector(".modal") as HTMLDivElement;
            //     hide.style.display = "none";
            //     this.login = data.login;
            //     this.getTaskListList();
            // }
            this.check();
            this.setLang(data.lang);
        });
    }
    async response(path: string, data: object){
        const response = await fetch(`http://127.0.0.1:${this.port}${path}`, {
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
            typeof data.message == "string" && this.notification(data.message, data.status);
            return data;
        }
    }
    public async check(){
        try {
            const body = {
                login: this.login,
                password: this.password
            }
            const data = await this.response('/api/auth', body);
            if(data.status === "success"){
                const hide = document.querySelector(".modal") as HTMLDivElement;
                hide.style.display = "none";
            }
        } catch(e: any) {
            console.error(`[check]: ${e.message}`);
        }
    }
    setLang(lang: Record<string, string>){
        this.lang = lang;
        document.querySelector("#manager-title")!.textContent = lang["taskManager"];
        document.querySelector("#list-title")!.textContent = lang["taskList"];
        document.querySelector("#task-title")!.textContent = lang["taskView"];
        document.querySelector(".task-description")!.textContent = lang["taskViewDescription"];
        (document.querySelector("#tasklist-name") as HTMLInputElement).placeholder = lang["createListPlaceholder"];
        (document.querySelector("#task-name") as HTMLInputElement).placeholder = lang["createTaskPlaceholder"];
        (document.querySelector("#task-description") as HTMLInputElement).placeholder = lang["descriptionPlaceholder"];
        (document.querySelector(".list-icon img") as HTMLImageElement).alt = lang["deleteAltText"];
        try{
            document.querySelector(".modal-title")!.textContent = lang["modalTitle"];
            document.querySelector("#modal-enter")!.textContent = lang["modalEnter"];
            (document.querySelector("#modal-login") as HTMLInputElement).placeholder = lang["login"];
            (document.querySelector("#modal-password") as HTMLInputElement).placeholder = lang["password"];
        } catch(e){
            console.warn(`[setLang]: Modal not found`);
        }
    }
    notification(message: string, type: string = "info") {
        console.log(`[${type}]: ${message}`);
        const notification = document.createElement('div');
        notification.classList.add('notification-msg', type);
        notification.textContent = message;
        document.body.appendChild(notification);
        setTimeout(() => {
            notification.remove();
        }, 2000);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    
});