const { contextBridge, ipcRenderer } = require("electron");
const { Socket } = require("electron-ipc-socket");

const socket = new Socket(ipcRenderer);

socket.open("main-win");

contextBridge.exposeInMainWorld("api", {
  sendRequestToGetNewLogFiles: () => {
    // socket.send("ready");
    socket
      .request("reload-deck")
      .then()
      .catch((err) => console.error(err));
  },
  getDeckData: () => {
    // socket.send("ready");
    socket
      .request("get-deck-data")
      .then((response) => {
        // console.log({response})
        if(response.playerData) {
          window.localStorage.setItem('playerData', JSON.stringify(response.playerData))
        }
        if(response.opponentData) {
          window.localStorage.setItem('opponentData', JSON.stringify(response.opponentData))
        }
      })
      .catch((err) => console.error(err));
  },
  setPlayerName: (playerName) => {
    socket
      .request("set-player-name", {playerName})
      .then((response) => {
        console.log({responseSetPlayerName: response})
      })
      .catch((err) => console.error(err));
  },
  // sendMessageUsingSocket: () => {
  //   socket.send("ready");
  //   socket
  //     .request("ping")
  //     .then((content) => console.log({ content }))
  //     .catch((err) => console.error(err));
  // },
  // readFileUsingSocket: () => {
  //   socket.send("ready");
  //   socket
  //     .request("file", "styles.css")
  //     .then((content) => console.log({ content }))
  //     .catch((err) => console.error(err));
  // },
  // getPingMessageFromMain: () => {
  //   socket.onRequest("ping-event", async (req) => {
  //     console.log({ req });
  //     return (Math.random() * 100) | 0;
  //   });
  // },
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
    toggle: () => ipcRenderer.invoke("dark-mode:toggle"),
    system: () => ipcRenderer.invoke("dark-mode:system"),
  },
});

window.addEventListener("DOMContentLoaded", () => {
  const replaceText = (selector, text) => {
    const element = document.getElementById(selector);
    if (element) element.innerText = text;
  };

  for (const dependency of ["chrome", "node", "electron"]) {
    replaceText(`${dependency}-version`, process.versions[dependency]);
  }
});
// document.addEventListener("DOMNodeInserted", function(event) {
//   if (!!window && !(!!window.$)) {
//       window.$ = window.jQuery = require('../../jquery.min.js');
//   }
// });
