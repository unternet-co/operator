const { app, BrowserWindow, ipcMain } = require('electron');
const fs = require('fs');
const path = require('path');
const todesktop = require('@todesktop/runtime');

todesktop.init();

let mainWindow;

function createWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 770,
    height: 650,
    // transparent: true,
    // vibrancy: 'under-window',
    webPreferences: {
      webviewTag: true,
      nodeIntegration: false, // is default value after Electron v5
      contextIsolation: true, // protect against prototype pollution
      enableRemoteModule: false, // turn off remote
      preload: path.join(__dirname, 'preload.js'),
    },
    // frame: false,
    titleBarStyle: 'hidden',
    trafficLightPosition: { x: 8, y: 8 },
  });

  if (!app.isPackaged) {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    // mainWindow.loadFile(path.join(__dirname, 'index.html'));
    mainWindow.loadURL('https://operator-lquj.onrender.com/');
  }
}

ipcMain.on('request-applets', async (event) => {
  const appletsPath = app.getPath('userData') + '/applets';

  if (!fs.existsSync(appletsPath)) {
    fs.mkdirSync(appletsPath, { recursive: true });
    console.log(`Folder created: ${appletsPath}`);
  }

  const filenames = await fs.readdirSync(appletsPath);
  const appletData = [];

  for (let filename of filenames) {
    const fileData = await fs.readFileSync(
      `${appletsPath}/${filename}`,
      'utf8'
    );
    appletData.push(fileData);
  }
  console.log(appletData);
  mainWindow.webContents.send('applets', appletData);
});

app.on('ready', createWindow);
app.on('window-all-closed', app.quit);
