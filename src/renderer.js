const textArea = document.getElementById("mainTextArea");

textArea.focus();
textArea.value = "";

const openButton = document.getElementById("openButton");
openButton.addEventListener("click", async () => {
  const data = await window.electronAPI.openFile();
  textArea.value = data;
});
