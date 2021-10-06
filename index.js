const { app, BrowserWindow, ipcMain, nativeTheme } = require('electron')
const path = require('path')

const fs = require('fs');

const pathFile = path.join(__dirname, 'package.json');

const data = fs.readFileSync(pathFile, 'utf-8');

console.log(data);


if(require('electron-squirrel-startup')) return;

// modify your existing createWindow() function
function createWindow () {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'src', 'preload.js'),
      contextIsolation: true,
      enableRemoteModule: false,
    },
    // webPreferences: {
    //   nodeIntegration: true
    // },
  })

  win.loadFile('index.html')

  win.webContents.on('did-finish-load', () => {
    win.webContents.send('ping', 'whoooooooh!')
  })

  ipcMain.handle('dark-mode:toggle', () => {
    if (nativeTheme.shouldUseDarkColors) {
      nativeTheme.themeSource = 'light'
    } else {
      nativeTheme.themeSource = 'dark'
    }
    return nativeTheme.shouldUseDarkColors
  })

  ipcMain.handle('dark-mode:system', () => {
    nativeTheme.themeSource = 'system'
  })

  ipcMain.on("toMain", (event, args) => {
    win.webContents.send("fromMain", data);
  });
}

app.whenReady().then(() => {
  createWindow()
})

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})