const { app, BrowserWindow, ipcMain, nativeTheme } = require('electron')
const { Socket, Transport, Event, InboundRequest } = require('electron-ipc-socket')
const path = require('path')

const fs = require('fs');

const pathFile = path.join(__dirname, 'package.json');

const data = fs.readFileSync(pathFile, 'utf-8');

if (require('electron-squirrel-startup')) return;

// modify your existing createWindow() function
function createWindow() {
  const win = new BrowserWindow({
    width: 200,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'src', 'core', 'preload.js'),
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

  const socket = new Socket(new Transport(ipcMain, win));
  socket.open('main-win');

  socket.onEvent('ready', evt => {
    console.log('Renderer process is ready', { evt });
  });

  socket.onRequest('ping', req => {
    console.log({ req })
    return 'pong';
  });

  // Return data to renderer
  socket.onRequest('file', async (req) => {
    const data = fs.readFileSync(req.data, 'utf-8');
    return data;
  });

  // Send data to renderer
  setInterval(() => {
    socket
      .request('ping-event', 'styles.css')
      .then(content => console.log({content}))
      .catch(err => console.error(err));
  }, 2000)

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