export class Task {
    constructor(name, description, done = false, date = null, lvl = 0) {
        this.name = name;
        this.done = done;
        this.description = description;
        this.date = date;
        this.lvl = lvl;
    }
    getColor() {
        if (this.date === null)
            return 0;
        const now = new Date();
        const date = new Date(this.date);
        const diff = date.getTime() - now.getTime();
        return diff < 604800000 ? 2 : diff < 2678400000 ? 1 : 0;
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
    getColor() {
        let max = 0;
        for (let i = 0; i < this.tasks.length; i++) {
            if (this.tasks[i].getColor() === 2)
                return 2;
            else
                max = Math.max(max, this.tasks[i].getColor());
        }
        return max;
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
    getUncheckedTasks() {
        return this.tasks.filter((t) => !t.done);
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