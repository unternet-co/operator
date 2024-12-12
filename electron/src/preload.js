const { contextBridge, ipcRenderer } = require('electron');

console.log('preload script running');
contextBridge.exposeInMainWorld('electron', {
  send: ipcRenderer.send,
  receive: (channel, func) => {
    ipcRenderer.on(channel, (event, ...args) => func(...args));
  },
});
