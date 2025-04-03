// Описание: Файл классов для реализации настроек пользователя
//
// Settings - класс для работы с настройками пользователя
//
// Автор: ivanvit100 @ GitHub
//         https://ivanvit.ru
// Лицензия: MIT

class Settings {
    constructor(UI) {
        this.UI = UI; 
        this.settings = {};
    }
    
    addCssFile(fileName) {
        if (!document.querySelector(`link[href*="${fileName}"]`)) {
            let link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = `/css/${fileName}`;
            document.head.appendChild(link);
            return link;
        }
        return null;
    }
    
    async response(path, data) {
        const response = await fetch(path, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify(data)
        });
        
        if (!response.ok) {
            if (response.status === 401) {
                this.UI.notification("Требуется авторизация", "error");
                const modal = document.querySelector(".modal");
                if (modal) modal.style.display = "block";
                throw new Error(`[response]: Требуется авторизация`);
            }
            throw new Error(`[response]: HTTP Error (${response.status})`);
        } else {
            const data = await response.json();
            if (typeof data.message === "string") {
                this.UI.notification(data.message, data.status);
            }
            return data;
        }
    }
    
    async loadSettings() {
        try {
            const data = await this.response('/api/v1/getSettings', {});
            if (data.status === "success") {
                this.settings = data.message;
                return this.settings;
            }
        } catch (error) {
            console.error(`[loadSettings]: ${error.message}`);
            this.UI.notification("Ошибка загрузки настроек", "error");
        }
        return {};
    }
    
    applySettings(settings) {
        if (!settings) return;
        
        if (settings.theme === "dark")
            document.body.classList.add('dark');
        else
            document.body.classList.remove('dark');
        
        if (settings["sort-order"]) this.UI.order = settings["sort-order"];
        
        if (settings["color-date-alert"]) {
            this.addCssFile("color-date-alert.css");
        } else {
            const link = document.querySelector('link[href*="color-date-alert.css"]');
            if (link) link.remove();
        }
    }
    
    populateSettingsForm() {
        const settings = this.settings;
        
        const themeSelect = document.getElementById('theme-select');
        if (themeSelect)
            themeSelect.value = settings.theme || (document.body.classList.contains('dark') ? 'dark' : 'light');
        
        const sortOrderSelect = document.getElementById('sort-order');
        if (sortOrderSelect)
            sortOrderSelect.value = settings["sort-order"] || this.UI.order || 'alphabet';
        
        const colorDateAlert = document.getElementById('color-date-alert');
        if (colorDateAlert) {
            colorDateAlert.checked = settings["color-date-alert"] || 
                !!document.querySelector('link[href*="color-date-alert.css"]');
        }
    }
    
    async saveSettings() {
        try {
            const settings = {};
            
            const themeSelect = document.getElementById('theme-select');
            if (themeSelect) 
                settings.theme = themeSelect.value;
            
            const sortOrderSelect = document.getElementById('sort-order');
            if (sortOrderSelect)
                settings["sort-order"] = sortOrderSelect.value;
            
            const colorDateAlert = document.getElementById('color-date-alert');
            if (colorDateAlert)
                settings["color-date-alert"] = colorDateAlert.checked;
            
            const response = await this.response('/api/v1/setSettings', settings);
            
            if (response.status === "success") {
                this.settings = settings;
                this.applySettings(settings);
                this.UI.notification("Настройки сохранены", "success");
            }
            
            return response;
        } catch (error) {
            console.error(`[saveSettings]: ${error.message}`);
            this.UI.notification("Ошибка сохранения настроек", "error");
        }
    }
    
    async createSettingsPage() {
        await this.loadSettings();
        
        const settingsHTML = `
        <section class="settings-page">
            <div class="inner-header">
                <h2 class="inner-header-title">Настройки</h2>
                <button onclick="closeSettings()" class="settings-back-button" title="Вернуться" aria-label="Вернуться">
                    ← Назад
                </button>
            </div>
            
            <div id="settings">
                <h2>Основные настройки</h2>
                
                <div class="settings-wrapper">
                    <div class="settings-card" style="--index: 0">
                        <div class="settings-group">
                            <label for="theme-select">Тема оформления:</label>
                            <select id="theme-select" class="settings-input">
                                <option value="light">Светлая</option>
                                <option value="dark">Темная</option>
                            </select>
                        </div>
                    </div>
                    
                    <div class="settings-card" style="--index: 1">
                        <div class="settings-group">
                            <label for="sort-order">Порядок сортировки:</label>
                            <select id="sort-order" class="settings-input">
                                <option value="alphabet">По алфавиту</option>
                                <option value="date">По дате</option>
                                <option value="priority">По приоритету</option>
                            </select>
                        </div>
                    </div>
                    
                    <div class="settings-card" style="--index: 2">
                        <div class="settings-group">
                            <label>
                                <input type="checkbox" id="color-date-alert">
                                Подсвечивать задачи по сроку
                            </label>
                        </div>
                    </div>
                </div>
                
                <button class="save-button" onclick="settings.saveSettings()">Сохранить настройки</button>
            </div>
        </section>`;
        
        return settingsHTML;
    }
    
    async showSettings(appBody, originalContent, currentState) {
        this.originalContent = originalContent;
        this.currentState = currentState;
        this.appBody = appBody;
        
        this.settingsCssLink = this.addCssFile("settings.css");
        appBody.innerHTML = await this.createSettingsPage();
        
        this.populateSettingsForm();
        
        window.settings = this;
    }
    
    closeSettings() {
        if (this.appBody && this.originalContent) {
            this.appBody.innerHTML = this.originalContent;
            
            if (this.currentState) {
                this.UI.setTaskList(this.currentState.taskList);
                this.UI.setTask(this.currentState.task);
                this.UI.state = this.currentState.state;
                
                this.UI.updateManagerUI();
                this.UI.updateListUI();
                this.UI.updateTaskUI();
                
                if (window.innerWidth < 1000)
                    window.state_switch();
            }
            
            if (this.settingsCssLink) {
                this.settingsCssLink.remove();
                this.settingsCssLink = null;
            }
        }
    }
}

export { Settings };