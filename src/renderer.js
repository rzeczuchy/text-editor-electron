const textArea = document.getElementById("mainTextArea");

textArea.focus();
textArea.value = "";

window.electronAPI.onOpenFile((value) => {
  textArea.value = value;
});
