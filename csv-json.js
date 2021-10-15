var readline = require('readline');
var fs = require('fs');

const obj = {}

const myInterface = readline.createInterface({
  input: fs.createReadStream('./new-data.txt')
});

myInterface.on('line', function (line) {
  // console.log({line})
  // console.log('Line number ' + lineno + ': ' + line);
  const [_, userID, userName] = line.match(/^([^,]+),(.+)/);
  obj[userName] = userID;
});

myInterface.on('close', function () {
  fs.writeFileSync('data.json', JSON.stringify(obj), 'utf-8');
});