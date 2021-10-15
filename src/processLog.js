
const fs = require('fs')
const chokidar = require('chokidar');
const readline = require('readline');
const NodeCache = require("node-cache");
const myCache = new NodeCache( { stdTTL: 600, checkperiod: 100 } );

const {
  logFileLocation,
  playerInfoLocation,
} = require('./const')

const {
  getGodNameAndUserIDAndDeck,
} = require('./game')

async function processLineByLine(path, playerName) {
  const fileStream = fs.createReadStream(path);

  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });

  for await (const line of rl) {
    if (line.includes("Set Power")) {
      await getGodNameAndUserIDAndDeck(line, playerName);
    }
  }
}

async function processLog() {

  const watcher = chokidar.watch(`${logFileLocation}\\**\\*Combat_Recorder_info.txt`, {
    persistent: true,
    ignored: [`${logFileLocation}\\**\\logs\\latest\\Combat_Recorder\\Combat_Recorder_info.txt`],
  });

  watcher
    .on('change', async path => {
      // console.log(`File ${path} has been changed`)
      let guDeckAssistantPlayer = myCache.get('guDeckAssistantPlayer')
      if(guDeckAssistantPlayer === undefined) {
        try {
          guDeckAssistantPlayer = fs.readFileSync(playerInfoLocation, 'utf-8')
        } catch (error) {

        }
        if (guDeckAssistantPlayer === undefined) {
          //
        } else {
          myCache.set('guDeckAssistantPlayer', guDeckAssistantPlayer, 1000);
          processLineByLine(path, guDeckAssistantPlayer);
        }
      } else {
        processLineByLine(path, guDeckAssistantPlayer);
      }
    })
}
processLog();
