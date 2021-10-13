
const fs = require('fs')
const chokidar = require('chokidar');
const readline = require('readline');

const {
  logFileLocation,
  playerInfoLocation,
} = require('./const')

const {
  // delay,
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
      // console.log(line)
      await getGodNameAndUserIDAndDeck(line, playerName);
    }
  }
}

async function processLog() {
  let playerName;

  while(!playerName) {
    try {
      playerName = fs.readFileSync(playerInfoLocation, 'utf-8')
      await delay(3000)
    } catch (error) {

    }
  }
  const watcher = chokidar.watch(`${logFileLocation}\\**\\*Combat_Recorder_info.txt`, {
    persistent: true,
    ignored: [`${logFileLocation}\\**\\logs\\latest\\Combat_Recorder\\Combat_Recorder_info.txt`],
  });

  watcher
    .on('change', async path => {
      // console.log(`File ${path} has been changed`)
      processLineByLine(path, playerName);
    })
}
processLog();
// module.exports = {
//   processLog,
// }
