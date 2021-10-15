const { app, BrowserWindow, ipcMain, nativeTheme } = require("electron");
const {
  Socket,
  Transport,
} = require("electron-ipc-socket");
const path = require("path");
const fs = require("fs");
const isDev = require('electron-is-dev');


const { logPlayerDataLocation, logOpponentDataLocation, playerInfoLocation } = require("./src/const");

if (require("electron-squirrel-startup")) return;
require('./src/processLog')


if (!isDev) {
  const server = 'https://update.electronjs.org'
  const feed = `${server}/bugb/electron-update-and-publish-example/${process.platform}-${process.arch}/${app.getVersion()}`

  autoUpdater.setFeedURL(feed)

  setInterval(() => {
    autoUpdater.checkForUpdates()
  }, 10 * 60 * 1000)
}

function createWindow() {
  const win = new BrowserWindow({
    width: 615,
    height: 726,
    webPreferences: {
      preload: path.join(__dirname, "src", "core", "preload.js"),
      contextIsolation: true,
      enableRemoteModule: false,
    },
    // webPreferences: {
    //   nodeIntegration: true
    // },
  });

  win.loadFile("index.html");

  // win.webContents.on("did-finish-load", () => {
  //   win.webContents.send("ping", "whoooooooh!");
  // });

  win.setAlwaysOnTop(true, 'screen');
  const socket = new Socket(new Transport(ipcMain, win));
  socket.open("main-win");

  socket.onEvent("ready", (evt) => {
    console.log("Renderer process is ready", { evt });
  });


  socket.onRequest("set-player-name", async (req) => {
    fs.writeFileSync(playerInfoLocation, req.data.playerName, 'utf-8')
    return 'ok'
  });

  socket.onRequest("get-deck-data", (req) => {
    let opponentData;
    let playerData;
    try {
      playerData = JSON.parse(fs.readFileSync(logPlayerDataLocation, 'utf-8'));
    } catch (error) {
    }
    try {
      opponentData = JSON.parse(fs.readFileSync(logOpponentDataLocation, 'utf-8'));
    } catch (error) {
    }
    return {
      playerData,
      opponentData,
    }
  });

  ipcMain.handle("dark-mode:toggle", () => {
    if (nativeTheme.shouldUseDarkColors) {
      nativeTheme.themeSource = "light";
    } else {
      nativeTheme.themeSource = "dark";
    }
    return nativeTheme.shouldUseDarkColors;
  });

  ipcMain.handle("dark-mode:system", () => {
    nativeTheme.themeSource = "system";
  });

  // ipcMain.on("toMain", (event, args) => {
  //   win.webContents.send("fromMain", data);
  // });
}

app.whenReady().then(() => {
  createWindow();
});

app.on("window-all-closed", function () {
  if (process.platform !== "darwin") app.quit();
});
