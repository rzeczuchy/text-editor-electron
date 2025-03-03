const {
  app,
  dialog,
  Menu,
  BrowserWindow,
  webContents,
  ipcMain,
} = require("electron");
const { readFile, writeFileSync } = require("node:fs");
const path = require("node:path");

if (require("electron-squirrel-startup")) {
  app.quit();
}

let currentFilePath = null;

const setCurrentFilePath = (window, path) => {
  console.log(path);
  currentFilePath = path;
  // TODO: properly validate path
  if (path == "") {
    window.setTitle("Untitled");
  } else {
    window.setTitle(path);
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

const openFile = async (mainWindow) => {
  dialog
    .showOpenDialog({})
    .then((result) => {
      if (!result.canceled) {
        const path = result.filePaths[0];
        readFile(path, "utf8", (err, data) => {
          if (err) throw err;
          mainWindow.webContents.send("open-file", data);
          setCurrentFilePath(mainWindow, path);
        });
      }
    })
    .catch((err) => {
      console.log(err);
    });
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
  if (currentFilePath === "") {
    console.log("path was not specified in handleSave");
    const window = getEventWindow(e);
    showSaveFileDialog(window);
  } else {
    writeFileSync(currentFilePath, data);
  }
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

  mainWindow.loadFile(path.join(__dirname, "index.html"));
};

app.whenReady().then(() => {
  ipcMain.on("save-file", handleSave);
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
