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
    let list = this.tasks.sort((a, b) => {
      return b.lvl - a.lvl;
    });
    return list.sort((a, b) => {
      if (a.done !== b.done) //Выполненные внизу
        return a.done ? 1 : -1;
      //Сортировка по дате выполнения
      const dateA = new Date(a.date as unknown as string);
      const dateB = new Date(b.date as unknown as string);
      const dateComparison = dateB.getTime() - dateA.getTime();
      return dateComparison;
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
