import { insertTabAtSelection } from "./rendererUtils.js";

const textArea = document.getElementById("mainTextArea");

textArea.focus();
textArea.value = "";

window.onkeydown = (e) => {
  if (e.key == "Tab") {
    e.preventDefault();
    insertTabAtSelection(textArea);
  }
};

window.electronAPI.onNewFile((value) => {
  textArea.value = "";
});

window.electronAPI.onOpenFile((value) => {
  textArea.value = value;
});

window.electronAPI.onGetSaveData((value) => {
  console.log("sending data from text area to main");
  const data = textArea.value;
  console.log("data is: " + data);
  window.electronAPI.saveFile(data);
});
