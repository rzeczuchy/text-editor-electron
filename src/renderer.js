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

window.electronAPI.onOpenFile((value) => {
  textArea.value = value;
});
