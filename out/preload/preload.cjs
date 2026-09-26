"use strict";
const electron = require("electron");
const plannerApi = {
  // Reads
  getTasks: () => electron.ipcRenderer.invoke("tasks:list"),
  getHabits: () => electron.ipcRenderer.invoke("habits:list"),
  getHabitLogs: () => electron.ipcRenderer.invoke("habit-logs:list"),
  getScheduleBlocks: () => electron.ipcRenderer.invoke("schedule-blocks:list"),
  // Task writes
  addTask: (task) => electron.ipcRenderer.invoke("tasks:add", task),
  toggleTask: (id) => electron.ipcRenderer.invoke("tasks:toggle", id),
  deleteTask: (id) => electron.ipcRenderer.invoke("tasks:delete", id),
  // Habit writes
  addHabit: (habit) => electron.ipcRenderer.invoke("habits:add", habit),
  deleteHabit: (id) => electron.ipcRenderer.invoke("habits:delete", id),
  logHabitDay: (habitId, date, completed) => electron.ipcRenderer.invoke("habits:logDay", { habitId, date, completed }),
  getStreak: (habitId) => electron.ipcRenderer.invoke("habits:getStreak", habitId),
  // Schedule writes
  addScheduleBlock: (block) => electron.ipcRenderer.invoke("schedule-blocks:add", block),
  deleteScheduleBlock: (id) => electron.ipcRenderer.invoke("schedule-blocks:delete", id)
};
electron.contextBridge.exposeInMainWorld("planner", plannerApi);
