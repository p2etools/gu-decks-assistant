document.getElementById('toggle-dark-mode').addEventListener('click', async () => {
  // const data = await window.ipcRenderer;
  // console.log({data});
  const isDarkMode = await window.api.darkMode.toggle()
  document.getElementById('theme-source').innerHTML = isDarkMode ? 'Dark' : 'Light'
  window.api.receive("fromMain", (data) => {
    console.log(`Received ${data} from main process`);
    document.getElementById('card-data').innerHTML = data
  });
  window.api.send("toMain", "some data");
})

document.getElementById('reset-to-system').addEventListener('click', async () => {
  await window.darkMode.system()
  document.getElementById('theme-source').innerHTML = 'System'
})