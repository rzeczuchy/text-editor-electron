const { app, dialog, Menu, BrowserWindow, ipcMain } = require("electron");
const { isValidFilePath } = require("./mainUtils.js");
const { readFile, writeFileSync } = require("node:fs");
const path = require("node:path");

if (require("electron-squirrel-startup")) {
  app.quit();
}

let currentFilePath = null;
let hasUnsavedChanges = false;
const unsavedChangesMarker = "*";
const appName = "Text Editor";
const versionNumber = "1.0";
const author = "rzeczuchy";
const gitHubLink = "github.com/rzeczuchy/text-editor-electron/issues";

const setCurrentFilePath = (window, path) => {
  if (path == "") {
    currentFilePath = path;
    window.setTitle("Untitled");
  } else if (isValidFilePath(path)) {
    currentFilePath = path;
    window.setTitle(path);
  } else {
    throw new Error(`invalid path in setCurrentFilePath: ${path}`);
  }
};

const changesSaved = (window) => {
  hasUnsavedChanges = false;
  const title = window.title;

  if (title.slice(-1) == unsavedChangesMarker) {
    window.setTitle(title.substring(0, title.length - 1));
  }
};

const getEventWindow = (e) => {
  const webContents = e.sender;
  const window = BrowserWindow.fromWebContents(webContents);
  return window;
};

const newFile = (mainWindow) => {
  setCurrentFilePath(mainWindow, "");
  mainWindow.webContents.send("new-file");
};

const showOpenFileDialog = (mainWindow) => {
  dialog
    .showOpenDialog({})
    .then((result) => {
      if (!result.canceled) {
        const path = result.filePaths[0];
        readFile(path, "utf8", (err, data) => {
          if (err) throw err;
          mainWindow.webContents.send("open-file", data);
          setCurrentFilePath(mainWindow, path);
          changesSaved(mainWindow);
        });
      }
    })
    .catch((err) => {
      console.log(err);
    });
};

const openFile = async (mainWindow) => {
  if (hasUnsavedChanges) {
    const choice = confirmClosingFile(mainWindow);
    // SAVE
    if (choice == 0) {
      saveFile(mainWindow);
    }
    // DON'T SAVE
    if (choice == 1) {
      showOpenFileDialog(mainWindow);
    }
    // CANCEL
    if (choice == 2) {
      return;
    }
  } else {
    showOpenFileDialog(mainWindow);
  }
};

const showSaveFileDialog = (mainWindow) => {
  dialog
    .showSaveDialog(mainWindow, {})
    .then((result) => {
      if (!result.canceled) {
        const path = result.filePath;
        setCurrentFilePath(mainWindow, path);
        mainWindow.webContents.send("get-save-data", currentFilePath);
      }
    })
    .catch((err) => {
      console.log(err);
    });
};

const saveFile = (mainWindow) => {
  // TODO: properly validate file path
  if (currentFilePath === "") {
    showSaveFileDialog(mainWindow);
  } else {
    mainWindow.webContents.send("get-save-data", currentFilePath);
  }
};

const saveFileAs = async (mainWindow) => {
  showSaveFileDialog(mainWindow);
};

const handleSave = (e, data) => {
  const window = getEventWindow(e);

  if (currentFilePath === "") {
    console.log("path was not specified in handleSave");
    showSaveFileDialog(window);
  } else {
    writeFileSync(currentFilePath, data);
    changesSaved(window);
  }
};

const handleFileChange = (e) => {
  if (!hasUnsavedChanges) {
    hasUnsavedChanges = true;
    const window = getEventWindow(e);
    window.setTitle(window.title + unsavedChangesMarker);
  }
};

const confirmClosingFile = (mainWindow) => {
  return dialog.showMessageBoxSync(mainWindow, {
    type: "question",
    buttons: ["Save", "Don't save", "Cancel"],
    title: "Save your changes before closing?",
    message: "Your file has unsaved changes. Save them before closing?.",
  });
};

const handleClose = (e, mainWindow) => {
  if (hasUnsavedChanges) {
    const choice = confirmClosingFile(mainWindow);
    // SAVE
    if (choice == 0) {
      e.preventDefault();
      saveFile(mainWindow);
    }
    // CANCEL
    if (choice == 2) {
      e.preventDefault();
    }
  }
};

const showAboutDialog = (mainWindow) => {
  return dialog.showMessageBox(mainWindow, {
    type: "info",
    buttons: ["Ok"],
    title: appName,
    message: `${appName}\nVersion: ${versionNumber}\nAuthor: ${author}\nSupport: ${gitHubLink}`,
  });
};

const createMenuTemplate = (mainWindow) => {
  const template = [
    // { role: 'fileMenu' }
    {
      label: "File",
      submenu: [
        {
          label: "New File",
          accelerator: "CmdOrCtrl+N",
          click: () => {
            newFile(mainWindow);
          },
        },
        { type: "separator" },
        {
          label: "Open File",
          accelerator: "CmdOrCtrl+O",
          click: () => {
            openFile(mainWindow);
          },
        },
        { type: "separator" },
        {
          label: "Save",
          accelerator: "CmdOrCtrl+S",
          click: () => {
            saveFile(mainWindow);
          },
        },
        {
          label: "Save As...",
          accelerator: "CmdOrCtrl+Shift+S",
          click: () => {
            saveFileAs(mainWindow);
          },
        },
        { type: "separator" },
        { role: "quit" },
      ],
    },
    // { role: 'editMenu' }
    {
      label: "Edit",
      submenu: [
        { role: "undo" },
        { role: "redo" },
        { type: "separator" },
        { role: "cut" },
        { role: "copy" },
        { role: "paste" },
        { role: "delete" },
        { type: "separator" },
        { role: "selectAll" },
      ],
    },
    // { role: 'viewMenu' }
    {
      label: "View",
      submenu: [
        { role: "resetZoom" },
        { role: "zoomIn" },
        { role: "zoomOut" },
        { type: "separator" },
        // TODO: remove
        { role: "reload" },
        { role: "forceReload" },
        { role: "toggleDevTools" },
      ],
    },
    // { role: 'helpMenu'}
    {
      label: "Help",
      submenu: [
        {
          label: "About",
          click: () => {
            showAboutDialog(mainWindow);
          },
        },
      ],
    },
  ];

  const menu = Menu.buildFromTemplate(template);
  return menu;
};

const createWindow = () => {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });

  const menu = createMenuTemplate(mainWindow);
  Menu.setApplicationMenu(menu);
  setCurrentFilePath(mainWindow, "");
  mainWindow.on("close", (e) => {
    handleClose(e, mainWindow);
  });

  mainWindow.loadFile(path.join(__dirname, "index.html"));
};

app.whenReady().then(() => {
  ipcMain.on("save-file", handleSave);
  ipcMain.on("file-changed", handleFileChange);
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
