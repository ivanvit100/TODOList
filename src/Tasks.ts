// Description: File with classes for tasks and task lists
// Task - class for tasks, have methods for working with single task
// TaskList - class for lists of tasks, have methods
//            for working with single list
//            or changing the json file directly
// TaskManager - class for managing lists of tasks, have methods
//               for working with lists of tasks
//               It is assumed that there is one manager per user  
// This file is part of the "Todo app" project
// Author: ivanvit100 @ GitHub
// Licence: MIT

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
  // Get the color of the task
  // The color depends on the date of the task
  // Color used in the task list UI
  // Input: none
  // Output: 0 - default color
  //         1 - yellow color
  //         2 - red color
  getColor() {
    if (this.date === null) return 0;
    const now = new Date();
    const date = new Date(this.date as unknown as string);
    const diff = date.getTime() - now.getTime();
    return diff < 604800000 ? 2 : diff < 2678400000 ? 1 : 0;
  }
  // Change task name
  // Input: name - new name of the task
  // Output: none
  changeName(name: string) {
    this.name = name;
  }
  // Change the state of the task (done or not)
  // Input: none
  // Output: none
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
  // Get the color of the nerby task in the task list
  // The color depends on the date of the task
  // Color used in the task list UI
  // Input: none
  // Output: 0 - default color
  //         1 - yellow color
  //         2 - red color
  getColor(){
    let max = 0;
    for (let i = 0; i < this.tasks.length; i++){
      if (this.tasks[i].getColor() === 2) return 2;
      else max = Math.max(max, this.tasks[i].getColor());
    }
    return max;
  }
  // Add a new task to the list
  // Input: task - the task to be added
  // Output: none
  addTask(task: Task) {
    this.tasks.push(task);
  }
  // Remnove a task from the list
  // Input: task - the task to be removed
  // Output: none
  removeTask(task: Task) {
    this.tasks = this.tasks.filter((t) => t !== task);
  }
  // Get all tasks from the list
  // Input: none
  // Output: sorted list of tasks
  //         sorted in next order:
  //         - done tasks are at the bottom
  //         - tasks which are have date are at the top
  //         - tasks are sorted by priority
  getTasks() {
    let list = this.tasks.sort((a, b) => {
      return b.lvl - a.lvl;
    });
    return list.sort((a, b) => {
      if (a.done !== b.done)
        return a.done ? 1 : -1;
      // The following transformation is used because Date 
      // objects are written to JSON as strings and 
      // returned to the object in this form
      const dateA = new Date(a.date as unknown as string);
      const dateB = new Date(b.date as unknown as string);
      const dateComparison = dateB.getTime() - dateA.getTime();
      return dateComparison;
    });
  }
  // Get all tasks from the list which are not done
  // Input: none
  // Output: array of tasks
  getUncheckedTasks() {
    return this.tasks.filter((t) => !t.done);
  }
  // Get a task by its name
  // Input: name - the name of the task
  // Output: Task object
  getTask(name: string) {
    return this.tasks.find((t) => t.name === name);
  }
  // Change the name of the list
  // Input: name - new name of the list
  // Output: none
  changeName(name: string) {
    this.name = name;
  }
}

export class TaskManager {
  private lists: TaskList[];
  constructor() {
    this.lists = [];
  }
  // Add a new list to the manager
  // Input: list - the list to be added
  // Output: none
  addList(list: TaskList) {
    this.lists.push(list);
  }
  // Remove a list from the manager
  // Input: list - the list to be removed
  // Output: none
  removeList(list: TaskList) {
    this.lists = this.lists.filter((l) => l !== list);
  }
  // Get array of all lists
  // Input: none
  // Output: array of lists
  //         sorted by name
  getLists() {
    return this.lists.sort((a, b) => a.name.localeCompare(b.name));
  }
  // Get a list by its name
  // Input: name - the name of the list
  // Output: TaskList object
  getList(name: string) {
    return this.lists.find((l) => l.name === name);
  }
}
