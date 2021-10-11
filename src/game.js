const fs = require("fs");
const axios = require("axios");
const axiosRetry = require("axios-retry");

const {
  logFileLocation,
  combatFolderSubString,
  readLogIntervalTime,
  godPowerObj,
  guDeckPlayerEndpoint,
  guCardDecodeEndpoint,
} = require("./const");
const { match } = require("assert");
// console.log({logFileLocation})

axiosRetry(axios, {
  retries: 3, // number of retries
  retryDelay: (retryCount) => {
    console.log(`retry attempt: ${retryCount}`);
    return retryCount * 2000; // time interval between retries
  },
  retryCondition: (error) => {
    // if retry condition is not specified, by default idempotent requests are retried
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.log(error.response.data);
      console.log(error.response.status);
      fs.appendFileSync(
        "./api-error.log",
        `\ndata: ${error.response.data}.\nStatus: ${error.response.status}`
      );
      // return (error.response.status + '').startsWith('5');
    } else if (error.request) {
      // The request was made but no response was received
      // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
      // http.ClientRequest in node.js
      console.log(error.request);
      fs.appendFileSync(
        "./api-error.log",
        `\request: ${error.request}.\nStatus: No response`
      );
    } else {
      // Something happened in setting up the request that triggered an Error
      console.log("Error", error.message);
      fs.appendFileSync(
        "./api-error.log",
        `\request: ${error.message}\n.Status: Something else happened`
      );
    }
    console.log(error.config);
    return error;
  },
});

// File handle
function getLatestFolder(pathToFolder, listExcludedFolder = ["x"]) {
  try {
    const listFolderWithCtime = fs.readdirSync(pathToFolder).map((name) => ({
      name,
      ctime: fs.statSync(`${pathToFolder}\\${name}`).ctime,
    }));
    const sortedLatestFolder = listFolderWithCtime.sort(
      (a, b) => b.ctime - a.ctime
    );
    for (const folder of sortedLatestFolder) {
      if (!listExcludedFolder.includes(folder.name)) {
        // console.log(folder)
        return `${pathToFolder}\\${folder.name}`;
      }
    }
    return;
  } catch (error) {
    console.log(error);
    return;
  }
}

function findFolderIncludeName(pathToFolder, name) {
  try {
    const listFolders = fs.readdirSync(pathToFolder);
    for (const folder of listFolders) {
      if (folder.includes(name)) {
        return `${pathToFolder}\\${folder}`;
      }
    }
    return;
  } catch (error) {
    return;
  }
}

function getLatestLogFile() {
  try {
    // it will return something like:
    // C:\Users\username\AppData\LocalLow\FuelGames\Gods Unchained - Version 0.39.0.2485(2021.8.19) - Built at 12_44_09
    const latestGameFolder = getLatestFolder(logFileLocation);
    console.log({ latestGameFolder });

    const latestGameLogFolder = getLatestFolder(`${latestGameFolder}\\logs`, [
      "latest",
    ]);

    const latestMatchFolder = getLatestFolder(latestGameLogFolder);
    console.log({ latestMatchFolder });
    const latestLogFolderLocation = findFolderIncludeName(
      latestMatchFolder,
      combatFolderSubString
    );
    console.log({ latestLogFolderLocation });
    const [latestLogFile] = fs.readdirSync(latestLogFolderLocation);
    console.log({ latestLogFile });

    const latestLogFileLocation = `${latestLogFolderLocation}\\${latestLogFile}`;

    console.log(latestLogFileLocation);
    return latestLogFileLocation;
  } catch (error) {
    return;
  }
}

// Get data from log file
// We will use localStorage here
// For development we can use local variable
// Return data
// {
//   player: {
//     god,
//     deck: [{item1: quantity, remaining (did not enter board), mana, type, detail}, ...,],
//     winrate (overall)
//   },
//   opponent: {
//     god,
//     deck: [{item1: quantity, remaining (did not enter board), mana, type, detail}, ...,],
//     winrate (overall)
//   }
// }

// This object will be get from initialized each time user click load data
const playersData = {
  player: {
    username: "",
    userid: "",
    god: "",
    encodedDeck: "",
    deck: [],
    winrate: 0,
  },
  opponent: {
    username: "",
    userid: "",
    god: "",
    encodedDeck: "",
    deck: [],
    winrate: 0,
  },
};

// function getPlayerName() {
//   return "chaugiang";
// }

function getPlayerID(playerName) {
  const userData = require('../data.json')
  // const playerID = userData[playerName];
  return userData[playerName]
}


// function mappingUser(username) {
//   if (username === getPlayerName()) {
//     return "player";
//   }
//   return "opponent";
// }

async function getDeckFromAPI(playerID, currentGod) {
  const option = {
    method: "GET",
    url: guDeckPlayerEndpoint + playerID,
  };
  try {
    const res = await axios(option);
    if (!res.data) return;
    for (const match of res.data) {
      let isWin = false;
      if (match.player_won + "" === playerID) {
        isWin = true;
      }
      const playerDeckKey = isWin ? "winner_deck" : "loser_deck";
      const deckData = match[playerDeckKey];
      const [playerGodForThisMatch] = deckData.split(",");
      if (playerGodForThisMatch === currentGod) {
        // console.log({isWin})
        // console.log({deckData})
        return deckData;
      }
    }
    return;
  } catch (error) {
    console.log("error when getting getDeckFromAPI ", error.message);
    return;
  }
}

async function getListCardFromAPI(deckEncodedString) {
  const listCardID = deckEncodedString.split(",");
  console.log(listCardID);

  const baseOption = {
    method: "GET",
  };
  let data = [];
  for (let i = 1; i < listCardID.length; i += 15) {
    const listPromises = [];
    for (let j = i; j < i + 15; j++) {
      if (j == listCardID.length) break;
      const tmp_opt = JSON.parse(JSON.stringify(baseOption));
      tmp_opt.url = guCardDecodeEndpoint + listCardID[j];
      listPromises.push(axios(tmp_opt));
    }
    const dataToSave = await Promise.all(listPromises);
    data = [...data, ...dataToSave];
  }
  try {
    const transformationListCardData = data.map(({ data: { mana, name } }) => ({
      mana,
      name,
    }));
    // console.log({ transformationListCardData });
    return transformationListCardData;
  } catch (error) {
    console.log("error when getting getListCardFromAPI ", error.message);
    return [];
  }
}

async function getGodNameAndUserIDAndDeck(string, playerName) {
  const userName = string.match(/Player: (.+) Set Power/)[1];
  const userPath = userName === playerName ? "player" : "opponent";
  // playersData[userPath].username = userName;
  const godPower = string.match(/Set Power To: (.+)/)[1].toLowerCase();
  console.log({ godPower, userName, playerName });
  let godName;
  for (const gp in godPowerObj) {
    if (godPower.includes(gp)) {
      // playersData[userPath].god = godPowerObj[gp];
      godName = godPowerObj[gp];
      break;
    }
  }
  const playerID = getPlayerID(userName)
  console.log({playerID})

  let playerData;
  if(!playerID) {
    playerData = {
      [userPath]: {
        godName,
        name: userName,
      }
    }
    return JSON.stringify(playerData, null, 2);;
  }
  const deckData = await getDeckFromAPI(playerID, godName);
  const listCard = await getListCardFromAPI(deckData);
  const tmpObj = {};
  for (const cardData of listCard) {
    if (!tmpObj[cardData.name]) {
      tmpObj[cardData.name] = { count: 1 };
      tmpObj[cardData.name].mana = cardData.mana;
    } else {
      tmpObj[cardData.name].count += 1;
    }
  }
  // console.log({ tmpObj });
  const data = [];
  const tmpKeys = Object.keys(tmpObj);
  for (const key of tmpKeys) {
    data.push({ name: key, mana: tmpObj[key].mana, count: tmpObj[key].count });
  }
  data.sort((a, b) => a.mana - b.mana);
  playerData = {
    [userPath]: {
      godName,
      name: userName,
      deck: data,
    }
  }
  return JSON.stringify(playerData, null, 2);
}
async function getDataFromLine(string, playerName) {
  if (string.includes("Set Power")) {
    return await getGodNameAndUserIDAndDeck(string, playerName);
  }
}

// User handle
async function getUserID() {
  // getting the info from our database
  return "748575";
}

async function getUserMatch() {
  return [];
}

async function getUserGod() {}

module.exports = {
  getLatestLogFile,
  getUserID,
  getUserMatch,
  getUserGod,
  getGodNameAndUserIDAndDeck,
  getDataFromLine,
};
