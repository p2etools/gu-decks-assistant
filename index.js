const { app, BrowserWindow, ipcMain, nativeTheme } = require("electron");
const {
  Socket,
  Transport,
  Event,
  InboundRequest,
} = require("electron-ipc-socket");
const path = require("path");
const fs = require("fs");

const { readLogIntervalTime } = require("./src/const");
const { getLatestLogFile, getDataFromLine } = require("./src/game");

if (require("electron-squirrel-startup")) return;

// modify your existing createWindow() function
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

  win.webContents.on("did-finish-load", () => {
    win.webContents.send("ping", "whoooooooh!");
  });

  win.webContents
    .executeJavaScript('localStorage.setItem("thekey", 12345);', true)
    .then((result) => {
      console.log(result);
    });

  // win.webContents
  //   .executeJavaScript('localStorage.getItem("thekey");', true)
  //   .then(result => {
  //     console.log(result);
  //   });

  // Read data from log file realtime

  let bite_size = 400;
  let readbytes = 0;
  let file;
  const latestLogFile = getLatestLogFile();
  console.log({ latestLogFile });
  function readData() {
    var stats = fs.fstatSync(file);
    if (stats.size < readbytes + 1) {
      console.log("====Waiting for new log====");
      setTimeout(readData, readLogIntervalTime);
    } else {
      // TODO: fix Buffer deprecated
      // (node:9424) [DEP0005] DeprecationWarning: Buffer() is deprecated due to security and usability issues.
      // Please use the Buffer.alloc(), Buffer.allocUnsafe(), or Buffer.from() methods instead.
      fs.read(
        file,
        new Buffer(bite_size),
        0,
        bite_size,
        readbytes,
        processLine
      );
    }
  }

  let lastLineFeed;
  let lineArray;

  async function processLine(err, bytecount, buff) {
    try {
      lastLineFeed = buff.toString("utf-8", 0, bytecount).lastIndexOf("\n");
      if (lastLineFeed > -1) {
        lineArray = buff
          .toString("utf-8", 0, bytecount)
          .slice(0, lastLineFeed)
          .split("\n");
        const playerName = await win.webContents.executeJavaScript(`localStorage.getItem("playerName")`, true)
        if(!playerName) {
          return;
        }
        for (const line of lineArray) {
          if (line.includes("Event")) {
            const data = await getDataFromLine(line, playerName);
            if (!data) {
              continue;
            }
            const dataForLocalStorage = JSON.stringify(data);
            // const existedData = await win.webContents.executeJavaScript(`localStorage.getItem("data")`, true)
            const playerJSON = JSON.parse(data)
            if(playerJSON.player) {
              await win.webContents.executeJavaScript(
                `localStorage.setItem("playerData", ${dataForLocalStorage});`,
                true
              );
            }
            if(playerJSON.opponent) {
              await win.webContents.executeJavaScript(
                `localStorage.setItem("opponentData", ${dataForLocalStorage});`,
                true
              );
            }
          }
        }

        // Set a new position to read from
        readbytes += lastLineFeed + 1;
      } else {
        // No complete lines were read
        readbytes += bytecount;
      }
      process.nextTick(readData);
    } catch (error) {
      console.log("error when processLine ", error.message);
    }
  }

  function fsReader(pathToFile) {
    fs.open(pathToFile, "r", function (err, fd) {
      file = fd;
      readData();
    });
  }

  fsReader(latestLogFile);

  const socket = new Socket(new Transport(ipcMain, win));
  socket.open("main-win");

  socket.onEvent("ready", (evt) => {
    console.log("Renderer process is ready", { evt });
  });

  socket.onRequest("ping", (req) => {
    console.log({ req });
    return "pong";
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
