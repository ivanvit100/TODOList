// Описание: Файл классов для работы с задачами
//
// Task - класс для задач, имеет методы для работы с задачей
// TaskList - класс для работы с задачами
//            Хранит все задачи внутри списка и 
//            предоставляет методы для работы с ними
// TaskManager - класс для работы со списками задач
//               Хранит все списки задач и 
//               предоставляет методы для работы с ними
//
// Автор: ivanvit100 @ GitHub
//         https://ivanvit.ru
// Лицензия: MIT

export class Task {
  constructor(
    name,
    description,
    done = false,
    date = null,
    lvl = 0
  ) {
    this.name = name;
    this.done = done;
    this.description = description;
    this.date = date;
    this.lvl = lvl;
  }

  // Получить цвет задачи
  // Цвет зависит от даты задачи
  // Цвет используется в интерфейсе списка задач
  // Input: none
  // Output: 0 - цвет по умолчанию
  //         1 - желтый цвет
  //         2 - красный цвет
  getColor() {
    if (this.date === null) return 0;
    const now = new Date();
    const date = new Date(this.date);
    const diff = date.getTime() - now.getTime();
    return diff < 604800000 ? 2 : diff < 2678400000 ? 1 : 0;
  }

  // Изменить имя задачи
  // Input: name - новое имя задачи
  // Output: none
  changeName(name) {
    this.name = name;
  }

  // Изменить статус задачи
  // Input: none
  // Output: none
  doneTask() {
    this.done = !this.done;
    return this.done;
  }
}

export class TaskList {
  constructor(name, icon="head") {
    this.name = name;
    this.tasks = [];
    this.icon = icon;
    this.saveToLocalStorage();
  }

  // Получить дату ближайшей задачи в списке
  // Вспомогательный геттер для сортировки списка
  // Input: none
  // Output: Date | null
  get date() {
    const dates = this.tasks
      .filter(task => !task.done && task.date)
      .map(task => new Date(task.date));
    return dates.length ? new Date(Math.min(...dates.map(date => date.getTime()))) : null;
  }

  // Получить приоритет максимальной задачи в списке
  // Вспомогательный геттер для сортировки списка
  // Input: none
  // Output: number
  get lvl() {
    const priorities = this.tasks
      .filter(task => !task.done)
      .map(task => task.lvl);
    return priorities.length ? Math.max(...priorities) : 0;
  }

  // Получить цвет списка
  // Цвет зависит от цвета задач в списке
  // Цвет используется в интерфейсе списка задач
  // Input: none
  // Output: 0 - цвет по умолчанию
  //         1 - желтый цвет
  //         2 - красный цвет
  getColor() {
    let max = 0;
    for (let i = 0; i < this.tasks.length; i++) {
      if (!this.tasks[i].done) {
        if (this.tasks[i].getColor() === 2) return 2;
        else max = Math.max(max, this.tasks[i].getColor());
      }
    }
    return max;
  }
  
  // Сохранить список задач в localStorage
  // Input: none
  // Output: none
  saveToLocalStorage() {
    try {
      localStorage.setItem('tasklist_' + this.name, JSON.stringify(this.tasks));
    } catch (error) {
      console.error(`Ошибка при сохранении списка ${this.name} в localStorage:`, error);
    }
  }
  
  // Добавить задачу в список
  // Input: task - задача для добавления
  // Output: none
  addTask(task) {
    this.tasks.push(task);
    this.saveToLocalStorage();
  }
  // Изменить задачу в списке
  // Input: task - задача для удаления
  // Output: none
  removeTask(task) {
    this.tasks = this.tasks.filter((t) => t !== task);
    this.saveToLocalStorage();
  }

  // Получить список задач
  // Input: none
  // Output: отсортированный массив задач
  //         сортировка происходит по следующим правилам:
  //         - выполненные задачи внизу
  //         - задачи без даты внизу
  //         - задачи сортируются по приоритету
  getTasks() {
    let list = this.tasks.sort((a, b) => {
      return b.lvl - a.lvl;
    });
    return list.sort((a, b) => {
      if (a.done !== b.done)
        return a.done ? 1 : -1;
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      const dateComparison = dateB.getTime() - dateA.getTime();
      return dateComparison;
    });
  }

  // Отфильтровать задачи по заданным критериям
  // Input: filter - массив фильтров
  // Output: отфильтрованный массив задач
  filtered(filter) {
    if (!filter || filter.length === 0) return this.getTasks();
    
    return this.getTasks().filter(task => {
      return filter.every(filterItem => {
        if (filterItem === "done") return task.done === true;
        if (filterItem === "undone") return task.done === false;
        if (filterItem === "has_date") return task.date !== null;
        if (filterItem === "no_date") return task.date === null;
        if (!isNaN(Number(filterItem))) return task.lvl >= Number(filterItem);
        return true; 
      });
    });
  }

  // Получить список невыполненных задач
  // Input: none
  // Output: массив невыполненных задач
  getUnreachTasks() {
    return this.tasks.filter((t) => !t.done);
  }

  // Получить задачу по имени
  // Input: name - имя задачи
  // Output: Task object
  getTask(name) {
    return this.tasks.find((t) => t.name === name);
  }

  // Изменить имя списка
  // Input: name - новое имя списка
  // Output: none
  changeName(name) {
    const currentIcon = this.icon;
    localStorage.removeItem('tasklist_' + this.name);
    this.name = name;
    this.icon = currentIcon;
    this.saveToLocalStorage();
    TaskManager.updateTasklistNames();
  }
}

export class TaskManager {
  constructor() {
    this.lists = [];
    this.filter = [];
    this.loadFromLocalStorage();
  }
  
  // Загрузить списки задач из localStorage
  // Input: none
  // Output: none
  loadFromLocalStorage() {
    try {
      let tasklistNames = [];
      
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('tasklist_'))
          tasklistNames.push(key.replace('tasklist_', ''));
      }
      
      tasklistNames.forEach(name => {
        const tasksData = localStorage.getItem('tasklist_' + name);
        if (tasksData) {
          try {
            const tasks = JSON.parse(tasksData);
            const taskList = new TaskList(name);
            taskList.tasks = [];
            
            tasks.forEach(taskData => {
              const task = new Task(
                taskData.name,
                taskData.description,
                taskData.done,
                taskData.date ? new Date(taskData.date) : null,
                taskData.lvl
              );
              taskList.tasks.push(task);
            });
            
            this.lists.push(taskList);
          } catch (error) {
            console.error(`Ошибка при загрузке списка ${name} из localStorage:`, error);
          }
        }
      });
    } catch (error) {
      console.error('Ошибка при загрузке данных из localStorage:', error);
    }
  }
  
  // Обновить список имен в localStorage
  // Input: none
  // Output: none
  static updateTasklistNames() {
    try {
      const manager = window.taskManager;
      if (manager && manager.lists) {
        const listNames = manager.lists.map(list => list.name);
        localStorage.setItem('tasklists', JSON.stringify(listNames));
      }
    } catch (error) {
      console.error('Ошибка при обновлении списка имен в localStorage:', error);
    }
  }
  
  // Добавить новый список в менеджер
  // Input: list - список задач
  // Output: none
  addList(list) {
    this.lists.push(list);
    TaskManager.updateTasklistNames();
  }
  
  // Удалить список из менеджера
  // Input: list - список задач
  // Output: none
  removeList(list) {
    try {
      if (!list || typeof list !== 'object' || !list.name) {
        throw new Error('Invalid list parameter provided');
      }
      
      const listName = list.name;
      
      localStorage.removeItem('tasklist_' + listName);
      this.lists = this.lists.filter((l) => l.name !== listName);
      TaskManager.updateTasklistNames();
      return true;
    } catch (error) {
      console.error(`[removeList]: ${error.message}`);
      return false;
    }
  }
  
  // Получить список списков задач
  // Input: order - отсортированный список задач ('alphabet', 'date', 'priority', 'count')
  // Output: array of lists
  getLists(order = "priority") {
    return this.lists.sort((a, b) => {
      switch (order) {
        case 'alphabet':
          return a.name.localeCompare(b.name);
        case 'date':
          if (!a.date) return 1;
          if (!b.date) return -1;
          return (Number(a.date || 0)) - Number((b.date || 0));
        case 'priority':
          return b.lvl - a.lvl;
        case 'count':
          return b.getUnreachTasks().length - a.getUnreachTasks().length;
        default:
          return 0;
      }
    });
  }
  
  // Получить список по имени
  // Input: name - имя списка
  // Output: TaskList object
  getList(name) {
    return this.lists.find((l) => l.name === name);
  }

  // Добавить фильтр в список активных фильтров
  // Input: filter - строка или число, представляющее фильтр
  // Output: none
  addFilter(filter) {
    if (!this.filter.includes(filter)) {
      this.filter.push(filter);
    }
  }

  // Удалить фильтр из списка активных фильтров
  // Input: filter - строка или число, представляющее фильтр
  // Output: none
  removeFilter(filter) {
    this.filter = this.filter.filter(f => f !== filter);
  }

  // Очистить все фильтры
  // Input: none
  // Output: none
  clearFilters() {
    this.filter = [];
  }
}

window.taskManager = window.taskManager || new TaskManager();