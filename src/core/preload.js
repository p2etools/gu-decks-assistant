const { contextBridge, ipcRenderer } = require('electron')
const { Socket } = require('electron-ipc-socket');
const socket = new Socket(ipcRenderer);

socket.open('main-win');

contextBridge.exposeInMainWorld(
  "api", {
      sendMessageUsingSocket: () => {

        socket.send('ready');
        socket
          .request('ping')
          .then(content => console.log({content}))
          .catch(err => console.error(err));
      },
      readFileUsingSocket: () => {

        socket.send('ready');
        socket
          .request('file', 'styles.css')
          .then(content => console.log({content}))
          .catch(err => console.error(err));
      },
      getPingMessageFromMain: () => {
        socket.onRequest('ping-event', async (req) => {
          console.log(2222)
          console.log({req});
          return Math.random()*100 | 0
        });
      },
      send: (channel, data) => {
          // whitelist channels
          let validChannels = ["toMain"];
          if (validChannels.includes(channel)) {
              ipcRenderer.send(channel, data);
          }
      },
      receive: (channel, func) => {
          let validChannels = ["fromMain"];
          if (validChannels.includes(channel)) {
              // Deliberately strip event as it includes `sender`
              ipcRenderer.on(channel, (event, ...args) => func(...args));
          }
      },
      darkMode: {
        toggle: () => ipcRenderer.invoke('dark-mode:toggle'),
        system: () => ipcRenderer.invoke('dark-mode:system'),
      }
  }
);


window.addEventListener('DOMContentLoaded', () => {
  const replaceText = (selector, text) => {
    const element = document.getElementById(selector)
    if (element) element.innerText = text
  }

  for (const dependency of ['chrome', 'node', 'electron']) {
    replaceText(`${dependency}-version`, process.versions[dependency])
  }
})