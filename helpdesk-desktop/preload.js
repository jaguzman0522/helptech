const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  executeAction: (action) => ipcRenderer.invoke('execute-action', action)
});
