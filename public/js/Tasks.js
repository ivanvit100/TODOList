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
    get date() {
        const dates = this.tasks
            .filter(task => !task.done && task.date)
            .map(task => new Date(task.date));
        return dates.length ? new Date(Math.min(...dates.map(date => date.getTime()))) : null;
    }
    get lvl() {
        const priorities = this.tasks
            .filter(task => !task.done)
            .map(task => task.lvl);
        return priorities.length ? Math.max(...priorities) : 0;
    }
    getColor() {
        let max = 0;
        for (let i = 0; i < this.tasks.length; i++) {
            if (!this.tasks[i].done) {
                if (this.tasks[i].getColor() === 2)
                    return 2;
                else
                    max = Math.max(max, this.tasks[i].getColor());
            }
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
    getUnreachTasks() {
        return this.tasks.filter((t) => !t.done);
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
    getLists(order = "alphabet") {
        return this.lists.sort((a, b) => {
            switch (order) {
                case 'alphabet':
                    return a.name.localeCompare(b.name);
                case 'date':
                    if (!a.date)
                        return 1;
                    if (!b.date)
                        return -1;
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
    getList(name) {
        return this.lists.find((l) => l.name === name);
    }
}
//# sourceMappingURL=Tasks.js.map