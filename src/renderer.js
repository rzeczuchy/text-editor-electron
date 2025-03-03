const textArea = document.getElementById("mainTextArea");

textArea.focus();
textArea.value = "";

window.onkeydown = (e) => {
  if ((e.key == "Tab")) {
    e.preventDefault();
    textArea.value += "\t";
  }
};

window.electronAPI.onOpenFile((value) => {
  textArea.value = value;
});
