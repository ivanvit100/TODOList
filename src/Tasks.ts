export class Task {
  name: string;
  done: boolean;
  description: string;
  date: Date | null;
  lvl: number;
  constructor(
    name: string,
    description: string,
    date: Date | null = null,
    lvl: number = 0
  ) {
    this.name = name;
    this.done = false;
    this.description = description;
    this.date = date;
    this.lvl = lvl;
  }
  changeName(name: string) {
    this.name = name;
  }
}

export class TaskList {
  name: string;
  private tasks: Task[];
  constructor(name: string) {
    this.name = name;
    this.tasks = [];
  }
  addTask(task: Task) {
    this.tasks.push(task);
  }
  removeTask(task: Task) {
    this.tasks = this.tasks.filter((t) => t !== task);
  }
  getTasks() {
    return this.tasks;
  }
  getTask(name: string) {
    return this.tasks.find((t) => t.name === name);
  }
  changeName(name: string) {
    this.name = name;
  }
}

export class TaskManager {
  private lists: TaskList[];
  constructor() {
    this.lists = [];
  }
  addList(list: TaskList) {
    this.lists.push(list);
  }
  removeList(list: TaskList) {
    this.lists = this.lists.filter((l) => l !== list);
  }
  getLists() {
    return this.lists;
  }
  getList(name: string) {
    return this.lists.find((l) => l.name === name);
  }
}
