const os = require("os");
const { username } = os.userInfo();

const logFileLocation = `C:\\Users\\${username}\\AppData\\LocalLow\\FuelGames`;
const logAppLocation = `C:\\Users\\${username}\\AppData\\LocalLow`;
const logPlayerDataLocation = `${logAppLocation}\\player.json`
const logOpponentDataLocation = `${logAppLocation}\\opponent.json`
const playerInfoLocation = `${logAppLocation}\\playerinfo.txt`
const logErrorLocation = `${logAppLocation}\\err-log-gudeckassistant.txt`

const combatFolderSubString = "Combat_Recorder";

const readLogIntervalTime = 3000;

const guDeckPlayerEndpoint =
  "https://gjhj0jayu2.execute-api.us-east-1.amazonaws.com/dev/meta/user?userId=";

const guCardDecodeEndpoint = "https://api.godsunchained.com/v0/proto/";

const godPowerObj = {
  undying: "death",
  blood: "death",
  neferu: "death",

  thievery: "deception",
  flip: "deception",
  orfeo: "deception",

  heal: "light",
  acolyte: "light",
  lysander: "light",

  clear: "magic",
  magebolt: "magic",
  genius: "magic",

  flourish: "nature",
  animal: "nature",
  selena: "nature",

  enrage: "war",
  slayer: "war",
  valka: "war",
};

module.exports = {
  logPlayerDataLocation,
  logOpponentDataLocation,
  playerInfoLocation,
  logErrorLocation,
  godPowerObj,
  guDeckPlayerEndpoint,
  guCardDecodeEndpoint,
};
