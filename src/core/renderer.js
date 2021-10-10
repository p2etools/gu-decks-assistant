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

// document.getElementById("poll-messages").addEventListener("click", async () => {
//   setInterval(() => {
//     console.log(window.localStorage.getItem("thekey2"))
//     document.getElementById("current-data").innerHTML = "Current data is: " + window.localStorage.getItem("thekey3")
//   }, 1000)
//   await window.api.getPingMessageFromMain();
// });

var jsonNames = { Mohamed: "saad", joseph: "Dankwah", Christian: "mensah" };

window.$.each(jsonNames, function (key, val) {
  window
    .$("<tr><td>" + key + "</td><td>" + val + "</td</tr>")
    .appendTo(".names");
});
