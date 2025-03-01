const textArea = document.getElementById("mainTextArea");

textArea.focus();
textArea.value = "";

textArea.addEventListener("drop", (e) => {
  e.preventDefault();
  e.stopPropagation();
  console.log(`File <${e.dataTransfer.files[0].name}> dropped in drop space.`);
});

textArea.addEventListener("dragover", (e) => {
  e.preventDefault();
  e.stopPropagation();
});

textArea.addEventListener("dragenter", (e) => {
  console.log("File is in the Drop Space");
});

textArea.addEventListener("dragleave", (e) => {
  console.log("File has left the Drop Space");
});
