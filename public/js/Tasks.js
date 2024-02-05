export class Task {
    constructor(name, description, done = false, date = null, lvl = 0) {
        this.name = name;
        this.done = done;
        this.description = description;
        this.date = date;
        this.lvl = lvl;
    }
    changeName(name) {
        this.name = name;
    }
    doneTask() {
        this.done = !this.done;
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