export class Task {
    constructor(name, description, date = null, lvl = 0) {
        this.name = name;
        this.done = false;
        this.description = description;
        this.date = date;
        this.lvl = lvl;
    }
    changeName(name) {
        this.name = name;
    }
}
export class TaskList {
    constructor(name) {
        this.name = name;
        this.tasks = [];
    }
    addTask(task) {
        this.tasks.push(task);
    }
    removeTask(task) {
        this.tasks = this.tasks.filter((t) => t !== task);
    }
    getTasks() {
        return this.tasks;
    }
    getTask(name) {
        return this.tasks.find((t) => t.name === name);
    }
    changeName(name) {
        this.name = name;
    }
}
export class TaskManager {
    constructor() {
        this.lists = [];
    }
    addList(list) {
        this.lists.push(list);
    }
    removeList(list) {
        this.lists = this.lists.filter((l) => l !== list);
    }
    getLists() {
        return this.lists;
    }
    getList(name) {
        return this.lists.find((l) => l.name === name);
    }
}
//# sourceMappingURL=Tasks.js.map