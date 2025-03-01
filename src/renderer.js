const textArea = document.getElementById("mainTextArea");

textArea.focus();
textArea.value = "";

const openButton = document.getElementById("openButton");
openButton.addEventListener("click", async (e) => {
  const data = await window.electronAPI.openFile(e);
  textArea.value = data;
});
