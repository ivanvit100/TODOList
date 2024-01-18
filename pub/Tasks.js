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
        return this.tasks.sort((a, b) => {
            if (a.lvl !== b.lvl) {
                return b.lvl - a.lvl;
            }
            if (a.date && b.date) {
                return a.date.getTime() - b.date.getTime();
            }
            return a.name.localeCompare(b.name);
        });
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
        return this.lists.sort((a, b) => a.name.localeCompare(b.name));
    }
    getList(name) {
        return this.lists.find((l) => l.name === name);
    }
}
//# sourceMappingURL=Tasks.js.map