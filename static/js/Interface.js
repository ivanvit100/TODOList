// Описание: Файл классов для работы с интерфейсом
//
// Interface - класс для работы с интерфейсом
//
// Автор: ivanvit100 @ GitHub
//         https://ivanvit.ru
// Лицензия: MIT

import { TaskManager } from "./Tasks.js";

export class Interface {
    constructor() {
        this.task = undefined;
        this.taskList = undefined;
        this.taskManager = new TaskManager();
        this.state = 0;
        this.order = "alphabet";
    }
    
    getDate(task) {
        if(!task) throw new Error(`[getDate]: Task not found`);
        const date = new Date(task.date);
        let formattedDate = Interface.noDate;
        if(date && date.getTime()) {
            const day = date.getDate();
            const month = date.getMonth() + 1;
            const year = date.getFullYear();
            formattedDate = `${day}.${month}.${year}`;
        }
        return {formattedDate, date};
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
    
    updateManagerUI() {
        const managerUI = document.querySelector("#manager");
        managerUI.innerHTML = "";
        for (let taskList of this.taskManager.getLists(this.order)) {
            const color = taskList.getColor();
            const icon = taskList.icon || "head";
            
            managerUI.innerHTML += `<li><button data-list-name="${taskList.name}" onclick="changeTaskList('${
                taskList.name
            }')">
                <img src="/icons/lists/${icon}.webp" alt="${icon}" width="18" height="18">
                <span class="list-name">${taskList.name}</span> 
                <span class="notification ${color == 2 ? "expired" : color === 1 ? "date" : ""}">${
                    taskList.getUnreachTasks().length
                }</span></button></li>`;
        }
    }
    
    updateListUI() {
        const listUI = document.querySelector("#list");
        listUI.innerHTML = "";
        if (!this.taskList) {
            document.querySelector("#list-name").innerText = "";
        } else {
            const tasks = this.taskList.filtered(this.taskManager.filter);
            
            for (let task of tasks) {
                const color = task.getColor();
                listUI.innerHTML += `<li><button data-task-name="${task.name}" onclick="changeTask('${task.name}')">
                    ${task.name} <span class="notification ${task.done ? "done" : ""}
                    ${color == 2 ? "expired" : color === 1 ? "date" : ""}">${task.lvl}</span>
                </button></li>`;
            }
            
            const titleElem = document.querySelector("#list-name");
            titleElem.innerHTML = this.taskList.name;
            
            if (this.taskManager.filter && this.taskManager.filter.length > 0) {
                const filterInfo = document.createElement('span');
                filterInfo.className = 'filter-info';
                filterInfo.innerHTML = ` | фильтров: ${this.taskManager.filter.length}`;
                titleElem.appendChild(filterInfo);
            }
            
            this.updateManagerUI();
        } 
    }

    updateTaskUI() {
        const taskUI = document.querySelector("#task");
        if (!this.taskList || !this.task) {
            taskUI.innerHTML = `
            <div class="task-view">
                <div class="inner-header" id="task-title">
                    <span class="inner-header-title">Просмотр задачи</span>
                </div>
                <p class="task-description">Выберите задачу для просмотра</p>
            </div>`;
            return;
        }
        
        try {
            const {formattedDate, date} = this.getDate(this.task);
            const dateABS = Math.abs(date.getTime() - new Date().getTime()) / (1000 * 3600 * 24);
            const regex = new RegExp("https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$");
            taskUI.innerHTML = `
            <div class="task-view">
                <div class="inner-header ${this.task.done ? "done" : ""}
                ${dateABS < 7 ? "expired" : dateABS <  31 ? "date" : ""}" 
                id="task-title">
                    <span class="inner-header-title">${this.task.name}</span>
                </div>
                <p class="task-description">${regex.test(this.task.description) ? 
                    "<iframe src='" + this.task.description + "'></iframe>": 
                    this.task.description}
                </p>
            </div>
            <div class="task-bottom">
                <div class="task-icons">
                    <button onclick="done()" class="task-icon"><img src="/icons/done.webp" alt="Отметить"></button>
                    <button onclick="editTask()" class="task-icon"><img src="/icons/edit.webp" alt="Редактировать"></button>
                    <button onclick="deleteTask()" class="task-icon"><img src="/icons/delete.webp" alt="Удалить"></button>
                </div>
                <div class="task-details">
                    <span class="task-importance">Приоритет: ${this.task.lvl}</span>
                    <span class="task-deadline">Срок: ${formattedDate}</span>
                </div>
                <div class="task-tag">
                    <span class="tag">${this.taskList.name}</span>
                </div>
            </div>`;
        } catch (error) {
            console.error(`[updateTaskUI]: ${error.message}`);
            taskUI.innerHTML = `
            <div class="task-view">
                <div class="inner-header" id="task-title">
                    <span class="inner-header-title">Просмотр задачи</span>
                </div>
                <p class="task-description">Выберите задачу для просмотра</p>
            </div>`;
        }
    }
    
    editTaskUI() {
        const taskUI = document.querySelector("#task");
        const {formattedDate} = this.getDate(this.task);
        taskUI.innerHTML = `<div class="task-view">
                <div class="inner-header done" id="task-title">
                    <span class="inner-header-title">Редактирование задачи <b>${this.task.name}</b></span>
                </div>
                <input type="text" id="task-name-edit" value="${this.task.name}">
                <textarea id="task-description-edit"></textarea>
                <input type="number" id="task-lvl-edit" value="${this.task.lvl}">
                <input type="date" id="task-date-edit" value="${formattedDate}">
            </div>
            <div class="task-bottom">
                <div class="task-icons">
                    <button onclick="editTask()" class="task-icon"><img src="/icons/edit.webp" alt="Сохранить"></button>
                </div>
                <div class="task-tag">
                    <span class="tag">${this.taskList.name}</span>
                </div>
            </div>`;
        const description = document.querySelector("#task-description-edit");
        description.innerText = this.task.description;
    }
    
    showFilterModal() {
        const modal = document.createElement('div');
        modal.className = 'modal filter-modal';
        modal.id = 'filter-modal';
        
        const currentFilters = this.taskManager.filter || [];
        const priorityFilter = currentFilters.find(f => !isNaN(Number(f)));
        
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-title">Фильтрация задач</div>
                <div class="modal-inputs">
                    <div class="settings-group">
                        <label>
                            <input type="checkbox" id="filter-done" name="filter" value="done" ${currentFilters.includes("done") ? 'checked' : ''}>
                            Только выполненные задачи
                        </label>
                    </div>
                    <div class="settings-group">
                        <label>
                            <input type="checkbox" id="filter-undone" name="filter" value="undone" ${currentFilters.includes("undone") ? 'checked' : ''}>
                            Только невыполненные задачи
                        </label>
                    </div>
                    <div class="settings-group">
                        <label>
                            <input type="checkbox" id="filter-has-date" name="filter" value="has_date" ${currentFilters.includes("has_date") ? 'checked' : ''}>
                            Только задачи с указанной датой
                        </label>
                    </div>
                    <div class="settings-group">
                        <label>
                            <input type="checkbox" id="filter-no-date" name="filter" value="no_date" ${currentFilters.includes("no_date") ? 'checked' : ''}>
                            Только задачи без даты
                        </label>
                    </div>
                    <div class="settings-group">
                        <label>Минимальный приоритет:</label>
                        <input type="number" id="priority-filter" min="0" value="${priorityFilter || 0}" class="modal-input">
                    </div>
                </div>
                <div class="modal-buttons">
                    <button id="apply-filters" class="modal-button">Применить</button>
                    <button id="reset-filters" class="modal-button gray">Сбросить все</button>
                    <button id="close-filter-modal" class="modal-button gray">Отмена</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        const filterDone = document.getElementById('filter-done');
        const filterUndone = document.getElementById('filter-undone');
        const filterHasDate = document.getElementById('filter-has-date');
        const filterNoDate = document.getElementById('filter-no-date');
        
        if (filterDone.checked) filterUndone.disabled = true;
        if (filterUndone.checked) filterDone.disabled = true;
        if (filterHasDate.checked) filterNoDate.disabled = true;
        if (filterNoDate.checked) filterHasDate.disabled = true;
        
        filterDone.addEventListener('change', function() {
            filterUndone.checked = !this.checked;
        });
        filterUndone.addEventListener('change', function() {
            filterDone.checked = !this.checked;
        });
        filterHasDate.addEventListener('change', function() {
            filterNoDate.checked = !this.checked;
        });
        filterNoDate.addEventListener('change', function() {
            filterHasDate.checked = !this.checked;
        });
        
        document.getElementById('apply-filters').addEventListener('click', () => {
            this.applyFilters();
            this.hideFilterModal();
        });
        
        document.getElementById('reset-filters').addEventListener('click', () => {
            this.taskManager.clearFilters();
            this.hideFilterModal();
            this.updateListUI();
        });
        
        document.getElementById('close-filter-modal').addEventListener('click', () => {
            this.hideFilterModal();
        });
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.hideFilterModal();
            }
        });
        
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                this.hideFilterModal();
                document.removeEventListener('keydown', handleEscape);
            }
        };
        
        document.addEventListener('keydown', handleEscape);
    }
    
    hideFilterModal() {
        const modal = document.getElementById('filter-modal');
        modal && modal.remove();
    }
    
    applyFilters() {
        this.taskManager.clearFilters();
        
        const filterCheckboxes = document.querySelectorAll('input[name="filter"]:checked');
        filterCheckboxes.forEach(checkbox => {
            this.taskManager.addFilter(checkbox.value);
        });
        
        const priorityFilter = document.getElementById('priority-filter');
        if (priorityFilter && priorityFilter.value && parseInt(priorityFilter.value) > 0)
            this.taskManager.addFilter(parseInt(priorityFilter.value));
        
        this.updateListUI();
    }
    
    state_switch() {
        console.log(this.state);
        if (window.innerWidth < 1080)
            document.querySelector(".app-body").style.transform = `translateX(calc(-100vw * ${this.state} + 10px * ${this.state}))`;
        else 
            document.querySelector(".app-body").style.transform = "initial";
    }
    
    getTask() { return this.task; }
    getTaskList() { return this.taskList; }
    getTaskManager() { return this.taskManager; }
    setTask(task) { this.task = task; }
    setTaskList(taskList) { this.taskList = taskList; }
}

Interface.noDate = "Не указан";