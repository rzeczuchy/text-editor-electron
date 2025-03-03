const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  onNewFile: (callback) =>
    ipcRenderer.on("new-file", (_event, value) => callback(value)),
  onOpenFile: (callback) =>
    ipcRenderer.on("open-file", (_event, value) => callback(value)),
  onGetSaveData: (callback) =>
    ipcRenderer.on("get-save-data", (_event,value) => callback(value)),
  saveFile: (data) =>
    ipcRenderer.send("save-file", data),
});
