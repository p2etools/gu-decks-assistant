document
  .getElementById("toggle-dark-mode")
  .addEventListener("click", async () => {
    const isDarkMode = await window.api.darkMode.toggle();
    document.getElementById("theme-source").innerHTML = isDarkMode
      ? "Dark"
      : "Light";
    window.api.receive("fromMain", (data) => {
      console.log(`Received ${data} from main process`);
      document.getElementById("card-data").innerHTML = data;
    });
    window.api.send("toMain", "some data");
    window.api.sendMessageUsingSocket();
  });

document
  .getElementById("reset-to-system")
  .addEventListener("click", async () => {
    await window.api.darkMode.system();
    document.getElementById("theme-source").innerHTML = "System";
  });

// document.getElementById("read-file").addEventListener("click", async () => {
//   await window.api.readFileUsingSocket();
// });

// document.getElementById("reload-deck").addEventListener("click", async () => {
//   await window.api.sendRequestToGetNewLogFiles();
//   await window.api.getDeckData();
// });

// $(".player-form").submit(function(event) {
//   alert( "Handler for .submit() called." );
//   console.log(1234)
//   event.preventDefault();
// });

$(".submit-btn").click(function(event) {
  event.preventDefault();
  $(".welcome-player").empty();
  const playerName = $('.player-name').val();
  window.localStorage.setItem('playerName', playerName);
  window.api.setPlayerName(playerName)
  window
    .$(`<p>Welcome ${playerName}</p>`)
    .appendTo(".welcome-player");
});

setInterval(async ()=>{
  $(".current-player").empty()
  await window.api.getDeckData();
  if(localStorage.playerData) {
    window
      .$(`<strong>Player Name: ${JSON.parse(localStorage.playerData).player.name}<strong>`)
      .appendTo(".current-player");
  }
  window
    .$("<tr class='player-deck-row'><th>Card name" + "</th><th>Mana" + " </th><th> Remaining" +  "</th></tr>")
    .appendTo(".current-player");
  if(localStorage.playerData) {
    $.each(JSON.parse(localStorage.playerData).player.deck, (k,v) => {
      window
        .$("<tr class='player-deck-row'><td>" + v.name + "</td><td>" + v.mana + " </td><td>" + v.count +  "</td></tr>")
        .appendTo(".current-player");
    });
  }
}, 3000)
setInterval(async ()=>{
  $(".opponent").empty()
  await window.api.getDeckData();
  if(localStorage.playerData) {
    window
      .$(`<strong>Opponent Name: ${JSON.parse(localStorage.opponentData).opponent.name}<strong>`)
      .appendTo(".opponent");
  }
  window
    .$("<tr class='opponent-deck-row'><th>Card name" + "</th><th>Mana" + " </th><th> Remaining" +  "</th></tr>")
    .appendTo(".opponent");
  if(localStorage.opponentData) {
    $.each(JSON.parse(localStorage.opponentData).opponent.deck, (k,v) => {
      window
        .$("<tr class='opponent-deck-row'><td>" + v.name + "</td><td>" + v.mana + " </td><td>" + v.count +  "</td></tr>")
        .appendTo(".opponent");
    });
  }
}, 3000)
