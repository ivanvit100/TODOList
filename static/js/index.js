// Описание: Основной скрипт для работы с задачами
// Реализует функции для работы с задачами и списками задач,
// а также функции для работы с интерфейсом и запросами к серверу.
// Включает в себя функции для работы с модальными окнами и настройками.
// Все функции доступны в глобальной области видимости.
//
// Автор: ivanvit100 @ GitHub
//         https://ivanvit.ru
// Лицензия: MIT

import { Task, TaskList } from "./Tasks.js";
import { Interface } from "./Interface.js";
import { Request } from "./Request.js";
import { Settings } from "./Settings.js"; 

document.addEventListener("DOMContentLoaded", () => {
  const customSelect = document.querySelector('.custom-select');
  const selectTrigger = customSelect.querySelector('.custom-select__trigger');
  const options = customSelect.querySelectorAll('.custom-option');
  const optionsContainer = customSelect.querySelector('.custom-options');
  const hiddenInput = document.querySelector('#tasklist-icon');
  
  window.showLoadingSpinner = function() {
    document.getElementById('loading-spinner').classList.add('active');
  };
  
  window.hideLoadingSpinner = function() {
    document.getElementById('loading-spinner').classList.remove('active');
  };
  
  let UI = new Interface();
  let req = new Request(UI);
  let settings = new Settings(UI); 

  selectTrigger.addEventListener('click', function() {
    optionsContainer.style.display = optionsContainer.style.display === 'block' ? 'none' : 'block';
    selectTrigger.classList.toggle('open');
  });
  
  options.forEach(option => {
    option.addEventListener('click', function() {
      selectTrigger.querySelector('span').textContent = this.textContent.trim();
      selectTrigger.querySelector('img').src = this.querySelector('img').src;
      
      options.forEach(opt => opt.classList.remove('selected'));
      this.classList.add('selected');
      
      hiddenInput.value = this.getAttribute('data-value');
      
      optionsContainer.style.display = 'none';
      selectTrigger.classList.remove('open');
    });
  });
  
  document.addEventListener('click', function(e) {
    if (!customSelect.contains(e.target)) {
      optionsContainer.style.display = 'none';
      selectTrigger.classList.remove('open');
    }
  });
  
  window.switchTheme = function() {
    const body = document.body;
    body.classList.contains("dark") ?
      body.classList.remove("dark") :
      body.classList.add("dark");
  };

  window.filterTasks = function() {
    UI.showFilterModal();
  };
  
  window.editTask = function(nameTask) {
    let name = document.querySelector("#task-name-edit");
    let description = document.querySelector("#task-description-edit");
    let lvl = document.querySelector("#task-lvl-edit");
    let date = document.querySelector("#task-date-edit");
    if (description === null)
      UI.editTaskUI();
    else {
      try {
        showLoadingSpinner();
        UI.getTask().name = name.value;
        UI.getTask().description = description.value;
        UI.getTask().lvl = parseInt(lvl.value);
        if (date.value.trim() !== "") {
          const [day, month, year] = date.value.split(".");
          UI.getTask().date = new Date(`${year}-${month}-${day}`);
        }
        UI.updateTaskUI();
        req.saveTaskList().finally(() => hideLoadingSpinner());
      } catch (error) {
        hideLoadingSpinner();
        UI.notification("Возникла ошибка при редактировании", "error");
        UI.updateListUI();
        throw new Error(`[editTask]: ${error.message}`);
      }
    }
    if (!UI.getTaskList())
      throw new Error(`[changeTaskList]: TaskList with name ${nameTask} not found`);
    else
      UI.updateListUI();
  };
  
  window.changeTaskList = function(name) {
    showLoadingSpinner();
    UI.setTaskList(UI.getTaskManager().getLists(UI.order).find((l) => l.name === name));
    if (!UI.getTaskList()) {
      hideLoadingSpinner();
      throw new Error(`[changeTaskList]: TaskList with name ${name} not found`);
    } else {
      UI.updateListUI();
      UI.state = 1;
      UI.state_switch(0, 1);
      
      isMobileView() && updateLayoutForScreenSize();
      
      hideLoadingSpinner();
    }
  };

  window.changeTask = function(name) {
    if (!UI.getTaskList()) throw new Error(`[changeTask]: TaskList not found`);
    else {
      UI.setTask(UI.getTaskList().getTasks().find((t) => t.name === name));
      UI.updateTaskUI();
      UI.state = 2;
      UI.state_switch(0, 2);
      
      isMobileView() && updateLayoutForScreenSize();
    }
  };
  
  window.deleteTask = async function() {
    if (!UI.getTask()) throw new Error(`[deleteTask]: Task not found`);
    else {
      showLoadingSpinner();
      
      try {
        UI.getTaskList().removeTask(UI.getTask());
        UI.setTask(undefined);
        UI.updateTaskUI();
        await req.saveTaskList();
      } catch (error) {
        UI.notification("Ошибка при удалении задачи", "error");
        UI.updateListUI();
      } finally {
        hideLoadingSpinner();
      }
    }
  };
  
  window.deleteList = async function() {
    if (!UI.getTaskList()) throw new Error(`[deleteList]: List not found`);
    else{
      showLoadingSpinner();
      const name = UI.getTaskList().name;
      try {
        await req.deleteList(name);
      } finally {
        hideLoadingSpinner();
      }
    }
  };
  
  window.done = async function() {
    if (!UI.getTask()) throw new Error(`[done]: Task not found`);
    else {
      showLoadingSpinner();
      
      try {
        const taskName = UI.getTask().name;
        const isCurrentlyDone = UI.getTask().done;
        
        const taskElements = document.querySelectorAll('#list li button');
        const taskPositions = {};
        
        taskElements.forEach(el => {
          const name = el.getAttribute('data-task-name');
          const rect = el.getBoundingClientRect();
          taskPositions[name] = {
            top: rect.top,
            height: rect.height
          };
        });
        
        UI.getTask().doneTask();
        UI.updateTaskUI();
        await animateTaskReordering(taskName, taskPositions);
        
        await req.saveTaskList();
        UI.notification(
          isCurrentlyDone ? "Задача отмечена как невыполненная" : "Задача отмечена как выполненная", 
          "success"
        );
      } catch(error) {
        UI.notification("Ошибка при изменении статуса задачи", "error");
        UI.updateListUI();
      } finally {
        hideLoadingSpinner();
      }
    }
  };
  
  async function animateTaskReordering(changedTaskName, previousPositions) {
    await new Promise(resolve => setTimeout(resolve, 10));
    
    const taskElements = document.querySelectorAll('#list li button');
    
    taskElements.forEach(el => {
      const name = el.getAttribute('data-task-name');
      const currentRect = el.getBoundingClientRect();
      
      if (previousPositions[name]) {
        const prevTop = previousPositions[name].top;
        const currentTop = currentRect.top;
        
        if (Math.abs(prevTop - currentTop) > 5) {
          const startY = prevTop - currentTop;
          
          el.style.setProperty('--start-y', `${startY}px`);
          el.style.animation = 'moveTask 0.5s ease forwards';
        }
        
        if (name === changedTaskName) el.style.animation = 'taskStatusChange 0.6s ease';
      }
    });
    
    return new Promise(resolve => {
      setTimeout(() => {
        taskElements.forEach(el => {
          el.style.animation = '';
        });
        resolve();
      }, 600);
    });
  }
  
  window.isMobileView = function() {
    return window.innerWidth <= 1080;
  };
  
  window.updateLayoutForScreenSize = function() {
    const sections = [
      document.querySelector('.taskmanager'),
      document.querySelector('.tasklist'),
      document.querySelector('.task-viewer')
    ];
    
    if (isMobileView()) {
      try {
        sections.forEach((section, index) => {
          if (index === UI.state) {
            section.classList.add('active');
          } else {
            section.classList.remove('active');
          }
        });
      } catch (error) {
        console.warn(`[updateLayoutForScreenSize]: Секции не найдены`);
      }
    } else {
      try {
        sections.forEach(section => {
          section.classList.remove('active');
        });
        document.querySelector(".app-body").style.transform = "initial";
      } catch (error) {
        console.warn(`[updateLayoutForScreenSize]: Секции не найдены`);
      }
    }
  };
  
  window.state_switch = function(mode = 0, explicitState = null) {
    const sections = [
      document.querySelector('.taskmanager'),
      document.querySelector('.tasklist'),
      document.querySelector('.task-viewer')
    ];

    if (explicitState !== null) {
      UI.state = explicitState;
    } else {
      UI.state = mode ? 
        UI.state === 2 ? 2 : UI.state + 1 :
        UI.state === 0 ? 0 : UI.state - 1;
    }

    if (isMobileView()) {
      sections.forEach((section, index) => {
        if (index === UI.state) {
          section.classList.add('active');
        } else {
          section.classList.remove('active');
        }
      });
    } else {
      document.querySelector(".app-body").style.transform = "initial";
    }
  };
  
  window.addEventListener('resize', function() {
    updateLayoutForScreenSize();
  });
  
  updateLayoutForScreenSize();
  
  window.logout = function() {
    showLoadingSpinner();
    req.logout().finally(() => hideLoadingSpinner());
  };
  
  window.openSettings = function() {
    const currentState = {
      taskList: UI.getTaskList(),
      task: UI.getTask(),
      state: UI.state
    };
    
    const appBody = document.querySelector('.app-body');
    const originalContent = appBody.innerHTML;
    
    showLoadingSpinner();
    settings.showSettings(appBody, originalContent, currentState)
      .finally(() => hideLoadingSpinner());
  };
  
  window.closeSettings = async function() {
    await settings.closeSettings();
    setupEventHandlers();
  };
  
  // Делегирование событий
  function setupEventHandlers() {
    document.addEventListener('click', function(globalEvent) {
      const newTaskButton = globalEvent.target.closest('#new-task');
      if (newTaskButton) {
        globalEvent.preventDefault();
        
        if(UI.getTaskList() === undefined) {
          UI.notification("Сначала создайте список задач", "error");
          return;
        }
        
        const name = document.querySelector("#task-name");
        const description = document.querySelector("#task-description");
        const lvl = document.querySelector("#task-lvl");
        const date = document.querySelector("#task-date");
        
        if(!name || !name.value.trim()) {
          UI.notification("Название задачи обязательно", "error");
          name && name.focus();
          return;
        }
        
        let dateVal = undefined;
        try {
          if (date && date.value && date.value.trim() !== "") {
            dateVal = new Date(date.value);
            
            if (dateVal.toString() === "Invalid Date") {
              UI.notification("Неверный формат даты", "error");
              date.focus();
              return;
            }
            
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            if (dateVal < today) {
              UI.notification("Дата должна быть в будущем", "error");
              date.focus();
              return;
            }
          }
        } catch (error) {
          UI.notification("Ошибка при обработке даты", "error");
          date && date.focus();
          return;
        }
        
        const lvlVal = lvl && lvl.value ? parseInt(lvl.value) : 0;
        if (lvl && lvl.value && lvl.value.trim() !== "" && (isNaN(lvlVal) || lvlVal < 0)) {
          UI.notification("Приоритет должен быть положительным числом", "error");
          lvl.focus();
          return;
        }
        
        const tempTask = new Task(
          name.value, 
          description ? description.value : "", 
          false, 
          dateVal, 
          isNaN(lvlVal) ? 0 : lvlVal
        );
        
        showLoadingSpinner();
        
        const tempTaskList = new TaskList(UI.getTaskList().name, UI.getTaskList().icon);
        
        UI.getTaskList().tasks.forEach(task => {
          tempTaskList.tasks.push(task);
        });
        
        tempTaskList.tasks.push(tempTask);
        
        const originalList = UI.getTaskList();
        UI.setTaskList(tempTaskList);
        
        req.saveTaskList()
          .then(response => {
            if (response.status === "success") {
              originalList.addTask(tempTask);
              
              if (name) name.value = "";
              if (description) description.value = "";
              if (lvl) lvl.value = "";
              if (date) date.value = "";
            }
          })
          .catch(error => {
            if (error.status === 400) {
              UI.notification(error.message || "Некорректные данные задачи", "error");
            } else if (error.status === 401 || error.status === 403) {
              UI.notification("Требуется авторизация. Пожалуйста, войдите в систему снова", "error");
              setTimeout(() => {
                window.location.reload();
              }, 2000);
            } else if (error.status >= 500) {
              UI.notification("Ошибка сервера. Пожалуйста, попробуйте позже", "error");
            } else {
              UI.notification("Ошибка при создании задачи", "error");
            }
          })
          .finally(() => {
            UI.setTaskList(originalList);
            UI.updateListUI();
            hideLoadingSpinner();
          });
      }

      const newTasklistButton = globalEvent.target.closest('#new-tasklist');
      if (newTasklistButton) {
        globalEvent.preventDefault();
        globalEvent.stopPropagation();
        
        const name = document.querySelector("#tasklist-name");
        const iconInput = document.querySelector("#tasklist-icon");
        
        if (!name || !name.value.trim()) {
          UI.notification("Название списка задач обязательно", "error");
          name && name.focus();
          return;
        }
        
        const iconValue = iconInput && iconInput.value ? iconInput.value : "head";
        
        const existingList = UI.getTaskManager().getLists().find(list => 
          list.name.toLowerCase() === name.value.trim().toLowerCase()
        );
        
        if (existingList) {
          UI.notification("Список с таким названием уже существует", "error");
          name.focus();
          return;
        }
        
        showLoadingSpinner();
        
        const tempTaskList = new TaskList(name.value, iconValue);
        
        const currentList = UI.getTaskList();
        UI.setTaskList(tempTaskList);
        
        req.saveTaskList()
          .then(response => {
            if (response.status === "success") {
              UI.getTaskManager().addList(tempTaskList);
              UI.setTaskList(tempTaskList);
              UI.updateManagerUI();
              UI.updateListUI();
              
              if (name) name.value = "";
            } else {
              UI.setTaskList(currentList);
            }
          })
          .catch(error => {
            if (error.status === 400) {
              UI.notification(error.message || "Некорректные данные списка задач", "error");
            } else if (error.status === 401 || error.status === 403) {
              UI.notification("Требуется авторизация. Пожалуйста, войдите в систему снова", "error");
              setTimeout(() => {
                window.location.reload();
              }, 2000);
            } else if (error.status >= 500) {
              UI.notification("Ошибка сервера. Пожалуйста, попробуйте позже", "error");
            } else {
              UI.notification("Ошибка при создании списка задач", "error");
            }
            UI.setTaskList(currentList);
          })
          .finally(() => {
            hideLoadingSpinner();
          });
      }
    });

    const loginBtn = document.querySelector('#modal-enter');
    if (loginBtn) {
      loginBtn.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        req.auth();
      });
    }

    const registerBtn = document.querySelector('#register-button');
    if (registerBtn) {
      registerBtn.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        req.register();
      });
    }

    document.addEventListener('click', function(globalEvent) {
      if (globalEvent.target && globalEvent.target.id === 'register-link') {
        globalEvent.preventDefault();
        globalEvent.stopPropagation();
        document.querySelector('.login-form').style.display = 'none';
        document.querySelector('.register-form').style.display = 'block';
      }
      else if (globalEvent.target && globalEvent.target.id === 'login-link') {
        globalEvent.preventDefault();
        globalEvent.stopPropagation();
        document.querySelector('.register-form').style.display = 'none';
        document.querySelector('.login-form').style.display = 'block';
      }
    });

    const body = document.body;
    const taskViewerSection = document.querySelector('.task-viewer');
    const header = document.querySelector('header');
    const settingsSection = document.querySelector('.settings-panel');

    body.addEventListener('click', function(e) {
      if (e.target && e.target.classList.contains('task-item')) {
        e.preventDefault();
        e.stopPropagation();
        const taskName = e.target.getAttribute('data-task-name');
        if (taskName) {
          window.changeTask(taskName);
        }
      }
      else if (e.target && e.target.classList.contains('list-item')) {
        e.preventDefault();
        e.stopPropagation();
        const listName = e.target.getAttribute('data-list-name');
        if (listName) {
          window.changeTaskList(listName);
        }
      }
    });

    if (taskViewerSection) {
      taskViewerSection.addEventListener('click', function(e) {
        e.stopPropagation();

        if (e.target && e.target.id === "delete-task") {
          e.preventDefault();
          window.deleteTask();
        }
        else if (e.target && e.target.id === "edit-task") {
          e.preventDefault();
          window.editTask();
        }
        else if (e.target && e.target.id === "done-task") {
          e.preventDefault();
          window.done();
        }
      });
    }

    if (header) {
      header.addEventListener('click', function(e) {
        e.stopPropagation();

        if (e.target && e.target.id === "theme-toggle") {
          e.preventDefault();
          window.switchTheme();
        }
        else if (e.target && e.target.id === "filter-button") {
          e.preventDefault();
          window.filterTasks();
        }
        else if (e.target && e.target.id === "settings-button") {
          e.preventDefault();
          window.openSettings();
        }
        else if (e.target && e.target.id === "logout-button") {
          e.preventDefault();
          window.logout();
        }
        else if (e.target && e.target.id === "back-button") {
          e.preventDefault();
          window.state_switch(0);
        }
      });
    }

    if (settingsSection) {
      settingsSection.addEventListener('click', function(e) {
        e.stopPropagation();

        if (e.target && e.target.id === "save-settings") {
          e.preventDefault();
          window.saveSettings();
        }
        else if (e.target && e.target.id === "close-settings") {
          e.preventDefault();
          window.closeSettings();
        }
      });
    }
  }

  setupEventHandlers();
});