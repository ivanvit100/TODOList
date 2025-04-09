import { Task, TaskList } from "./Tasks.js";

export class Request {
  constructor(UI) {
    this.login = "";
    this.password = "";
    this.UI = UI;
    
    this.validateTokenAndLoadData();
  }

  async loadSettings() {
    try {
      await this.response('https://todo.ivanvit.ru/api/v1/getSettings', {})
      .then(data => {
        if (data["message"]["color-date-alert"]) {
          let link = document.createElement('link');
          link.rel = 'stylesheet';
          link.href = '/css/color-date-alert.css';
          document.head.appendChild(link);
        }
        
        if (data.message.theme === "dark") document.body.classList.add("dark");
        else document.body.classList.remove("dark");
        
        this.UI.order = data["message"]["sort-order"];

        document.getElementById('openMenu')?.addEventListener('click', () => {
          window.openSettings();
        });
        
        const registerLink = document.getElementById('register-link');
        const loginLink = document.getElementById('login-link');
        
        if (registerLink) {
          registerLink.addEventListener('click', (e) => {
            e.preventDefault();
            document.querySelector('.login-form').style.display = 'none';
            document.querySelector('.register-form').style.display = 'block';
          });
        }
        
        if (loginLink) {
          loginLink.addEventListener('click', (e) => {
            e.preventDefault();
            document.querySelector('.register-form').style.display = 'none';
            document.querySelector('.login-form').style.display = 'block';
          });
        }
      })
      .catch(error => {
        console.error("Ошибка при получении конфигурации:", error);
        this.UI.notification("Ошибка при получении конфигурации", "error");
      });
    } catch (error) {
      console.error(`[loadSettings]: ${error.message}`);
      this.UI.notification("Ошибка загрузки настроек", "error");
    }
    return {};
  }
  
  async validateTokenAndLoadData() {
    let data = await this.response('https://todo.ivanvit.ru/api/v1/validateToken', {});
    if (data.status === "success") {
      await this.loadSettings();
      this.getTaskListList();
      const modal = document.querySelector(".modal");
      if (modal) modal.style.display = "none";
    }
  }
  
  loadFromLocalStorage() {
    try {
      let tasklistNames = [];
      let foundLists = false;
      
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('tasklist_')) {
          tasklistNames.push(key.replace('tasklist_', ''));
          foundLists = true;
        }
      }
      
      if (!foundLists) return false;
      
      this.UI.getTaskManager().loadFromLocalStorage();
      this.UI.updateManagerUI();
      
      if (this.UI.getTaskManager().lists.length > 0) {
        this.UI.setTaskList(this.UI.getTaskManager().lists[0]);
        this.UI.updateListUI();
      }
      
      return true;
    } catch (error) {
      console.error('Ошибка при загрузке данных из localStorage:', error);
      return false;
    }
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
        const modal = document.querySelector(".modal");
        if (modal) modal.style.display = "block";
        throw new Error(`[response]: Требуется авторизация`);
      }
      throw new Error(`[response]: HTTP Error (${response.status})`);
    } else {
      const data = await response.json();
      typeof data.message == "string" && this.UI.notification(data.message, data.status);
      return data;
    }
  }

  async check() {
    try {
      const body = {
        login: this.login,
        password: this.password
      }
      const data = await this.response('https://todo.ivanvit.ru/api/v1/auth', body);
      if(data.status === "success") {
        await this.loadSettings();
        const hide = document.querySelector(".modal");
        hide.style.display = "none";
        
        this.UI.getTaskManager().lists = [];
        this.getTaskListList();
        this.UI.updateTaskUI();
      }
    } catch(e) {
      console.error(`[check]: ${e.message}`);
    }
  }

  async auth() {
    try {
      const loginInp = document.querySelector("#modal-login");
      const passwordInp = document.querySelector("#modal-password");
      this.login = loginInp.value.trim();
      this.password = passwordInp.value.trim();
      if(this.login === "" || this.password === "") {
        this.UI.notification("Заполните поля", "error");
        throw new Error(`Login or password is empty`);
      } else {
        this.check();
      }
    } catch (error) {
      console.error(`[auth]: ${error.message}`);
    }
  }
    
  async logout() {
    try {
      await fetch('https://todo.ivanvit.ru/api/v1/logout', {
        method: 'POST',
        credentials: 'include'
      });
      
      this.login = "";
      this.password = "";
      
      const modal = document.querySelector(".modal");
      if (modal) modal.style.display = "block";
      
      this.UI.setTask(undefined);
      this.UI.setTaskList(undefined);
      this.UI.getTaskManager().lists = [];
      this.UI.updateManagerUI();
      this.UI.updateListUI();
      this.UI.updateTaskUI();
      
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const key = localStorage.key(i);
        key && key.startsWith('tasklist_') && localStorage.removeItem(key);
      }
      localStorage.removeItem('tasklists');
    } catch (error) {
      console.error(`[logout]: ${error.message}`);
    }
  }
  
  async register() {
    try {
      const registerLogin = document.querySelector("#register-login");
      const registerPassword = document.querySelector("#register-password");
      const confirmPassword = document.querySelector("#register-confirm-password");
      
      const login = registerLogin.value.trim();
      const password = registerPassword.value.trim();
      const confirm = confirmPassword.value.trim();
      
      if(login === "" || password === "" || confirm === "") {
        this.UI.notification("Заполните все поля", "error");
        throw new Error(`Registration fields are empty`);
      }
      
      if(password !== confirm) {
        this.UI.notification("Пароли не совпадают", "error");
        throw new Error(`Passwords don't match`);
      }
      
      if(password.length < 6) {
        this.UI.notification("Пароль должен содержать минимум 6 символов", "error");
        throw new Error(`Password too short`);
      }
      
      const body = {
        login: login,
        password: password
      }
      
      const data = await this.response('https://todo.ivanvit.ru/api/v1/register', body);
      
      if(data.status === "success") {
        this.login = login;
        
        const hide = document.querySelector(".modal");
        hide.style.display = "none";
        
        this.UI.getTaskManager().lists = [];
        this.getTaskListList();
        this.UI.updateTaskUI();
        
        registerLogin.value = "";
        registerPassword.value = "";
        confirmPassword.value = "";
      }
    } catch (error) {
      console.error(`[register]: ${error.message}`);
    }
  }

  async saveTaskList() {
    try {
      if (!this.UI.getTaskList()) throw new Error('No active task list to save');
      
      this.UI.getTaskList().saveToLocalStorage();
      
      const iconValue = this.UI.getTaskList().icon || 'head';
      
      const body = {
        taskList: this.UI.getTaskList().name,
        icon: iconValue,
        data: {"data": this.UI.getTaskList().getTasks()}
      };
      
      const response = await this.response('https://todo.ivanvit.ru/api/v1/saveTaskList', body);
      
      this.UI.setTask(undefined);
      this.UI.updateTaskUI();
      this.UI.updateListUI();
      
      return response; 
    } catch (error) {
      console.error(`[saveTaskList]: ${error.message}`);
      this.UI.notification("Ошибка при сохранении списка задач", "error");
      throw error; 
    }
  }

  async getTaskListList() {
    try {
      const data = await this.response('https://todo.ivanvit.ru/api/v1/getTaskListList', {});
      this.UI.getTaskManager().lists = [];
      
      for (let i = 0; i < data.message.length; i++) {
        const listItem = data.message[i];
        let listName, icon;
        
        if (typeof listItem === 'string') {
          listName = listItem;
          icon = 'head';
        } else {
          listName = listItem.name;
          icon = listItem.icon || 'head';
        }
        
        let tl = new TaskList(listName, icon);
        
        this.UI.getTaskManager().addList(tl);
        this.UI.setTaskList(tl);
        
        const localData = localStorage.getItem('tasklist_' + listName);
        if (localData) {
          try {
            const tasks = JSON.parse(localData);
            
            if (tasks.length > 0) {
              tasks.forEach(taskData => {
                const task = new Task(
                  taskData.name,
                  taskData.description,
                  taskData.done,
                  taskData.date ? new Date(taskData.date) : null,
                  taskData.lvl
                );
                tl.tasks.push(task);
              });
            } else {
              await this.loadTasksFromServer(listName, tl);
            }
          } catch (error) {
            console.error(`Ошибка при загрузке списка ${listName} из localStorage:`, error);
            await this.loadTasksFromServer(listName, tl);
          }
        } else {
          await this.loadTasksFromServer(listName, tl);
        }
      }
      
      this.UI.updateManagerUI();
      this.UI.updateListUI();
    } catch (error) {
      console.error(`[getTaskListList]: ${error.message}`);
      throw error;
    }
  }
  
  async loadTasksFromServer(listName, taskList) {
    const body = { taskList: listName };
    const taskData = await this.response('https://todo.ivanvit.ru/api/v1/getTaskList', body);
    
    if (taskData && taskData.message) {
      if (taskData.message.icon && 
        taskData.message.icon !== 'default' && 
        (!taskList.icon || taskList.icon === 'head')) {
        
        taskList.icon = taskData.message.icon;
        console.log(`Установлена иконка ${taskData.message.icon} для списка ${listName}`);
      }
      
      if (taskData.message.data) {
        for(let j = 0; j < taskData.message.data.length; j++) {
          let task = taskData.message.data[j];
          let newTask = new Task(
            task.name, 
            task.description, 
            task.done, 
            task.date, 
            task.lvl
          );
          taskList.tasks.push(newTask);
        }
        taskList.saveToLocalStorage();
      }
    }
  }
  
  async getTaskList(name = "default") {
    try {
      const taskList = this.UI.getTaskManager().getList(name);
      
      if (taskList && taskList.tasks.length > 0) {
        if (this.UI.getTaskList() && this.UI.getTaskList().name === name) this.UI.updateListUI();
        return taskList;
      }
      
      const localData = localStorage.getItem('tasklist_' + name);
      
      if (localData) {
        try {
          const tasks = JSON.parse(localData);
          if (tasks.length > 0) {
            let list = taskList || new TaskList(name);
            if (!taskList) this.UI.getTaskManager().addList(list);
            
            tasks.forEach(taskData => {
              const task = new Task(
                taskData.name,
                taskData.description,
                taskData.done,
                taskData.date ? new Date(taskData.date) : null,
                taskData.lvl
              );
              list.tasks.push(task);
            });
            
            this.UI.updateListUI();
            return list;
          }
        } catch (error) {
          console.error(`Error parsing localStorage data for ${name}:`, error);
        }
      }
      
      const body = { taskList: name };
      const data = await this.response('https://todo.ivanvit.ru/api/v1/getTaskList', body);
      
      let list = taskList || new TaskList(name);
      if (!taskList) this.UI.getTaskManager().addList(list);
      
      if (data.message.icon && 
          (!list.icon || list.icon === 'head')) {
        list.icon = data.message.icon;
      }
      
      list.tasks = [];
      
      if (data.message.data) {
        for (let i = 0; i < data.message.data.length; i++) {
          const taskData = data.message.data[i];
          const newTask = new Task(
            taskData.name,
            taskData.description,
            taskData.done,
            taskData.date ? new Date(taskData.date) : null,
            taskData.lvl
          );
          list.tasks.push(newTask);
        }
        list.saveToLocalStorage();
      }
      
      if (this.UI.getTaskList() && this.UI.getTaskList().name === name) {
        this.UI.updateListUI();
      }
      
      return list;
    } catch (error) {
      console.error(`[getTaskList]: ${error.message}`);
      return null;
    }
  }

  async deleteList(name) {
    try {
      localStorage.removeItem('tasklist_' + name);
      
      const body = {
        taskList: name
      }
      const data = await this.response('https://todo.ivanvit.ru/api/v1/deleteList', body);
      const taskManager = this.UI.getTaskManager();
      const taskList = taskManager.getList(name);
      
      taskList ? taskManager.removeList(taskList) : TaskManager.updateTasklistNames();
      
      await this.UI.setTaskList(undefined);
      this.UI.updateManagerUI();
      this.UI.updateListUI();
      
      return data.message;
    } catch (error) {
      console.error(`[deleteList]: ${error.message}`);
      return false;
    }
  }
}