document.getElementById('toggle-dark-mode').addEventListener('click', async () => {
  const isDarkMode = await window.api.darkMode.toggle()
  document.getElementById('theme-source').innerHTML = isDarkMode ? 'Dark' : 'Light'
  window.api.receive("fromMain", (data) => {
    console.log(`Received ${data} from main process`);
    document.getElementById('card-data').innerHTML = data
  });
  window.api.send("toMain", "some data");
  window.api.sendMessageUsingSocket();
})

document.getElementById('reset-to-system').addEventListener('click', async () => {
  await window.api.darkMode.system()
  document.getElementById('theme-source').innerHTML = 'System'
})

document.getElementById('read-file').addEventListener('click', async () => {
  await window.api.readFileUsingSocket()
})

document.getElementById('poll-messages').addEventListener('click', async () => {
  await window.api.getPingMessageFromMain()
})