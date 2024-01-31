export class Task {
  name: string;
  done: boolean;
  description: string;
  date: Date | null;
  lvl: number;
  constructor(
    name: string,
    description: string,
    done: boolean = false,
    date: Date | null = null,
    lvl: number = 0
  ) {
    this.name = name;
    this.done = done;
    this.description = description;
    this.date = date;
    this.lvl = lvl;
  }
  changeName(name: string) {
    this.name = name;
  }
  doneTask() {
    this.done = !this.done;
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
    return this.tasks.sort((a, b) => {
      if (a.done !== b.done) //Выполненные внизу
        return a.done ? 1 : -1;
      if (a.lvl !== b.lvl) //Самые срочные сверху
        return b.lvl - a.lvl;
      //TODO: fix date format
      if (a.date && b.date) //Самые ранние сверху
        return a.date.getTime() - b.date.getTime();
      return a.name.localeCompare(b.name);
    });
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
    return this.lists.sort((a, b) => a.name.localeCompare(b.name));
  }
  getList(name: string) {
    return this.lists.find((l) => l.name === name);
  }
  findList(list: string) {
    return this.lists.find((l) => l.name === list);
  }
}
