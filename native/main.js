const { app, BrowserWindow, shell, ipcMain } = require('electron');
const fs = require('fs');
const path = require('path');
const todesktop = require('@todesktop/runtime');

todesktop.init();

let mainWindow;

function createWindow() {
  /* Create the browser window. */

  win = new BrowserWindow({
    width: 770,
    height: 790,
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
    trafficLightPosition: { x: 12, y: 12 },
  });

  /* Handle links */

  win.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url); // Open the URL in the default system browser
    return { action: 'deny' };
  });
  win.webContents.on('will-navigate', (event, url) => {
    if (url !== win.webContents.getURL()) {
      event.preventDefault(); // Prevent navigation
      shell.openExternal(url); // Open the URL in the default system browser
    }
  });

  /* Load web content */

  if (!app.isPackaged) {
    win.loadURL('http://localhost:5173');
    win.webContents.openDevTools();
  } else {
    // mainWindow.loadFile(path.join(__dirname, 'index.html'));
    win.loadURL('https://operator.unternet.co');
  }
}

ipcMain.handle('fetch', async (event, url) => {
  try {
    const response = await fetch(url);
    const text = await response.text();
    return text;
  } catch (error) {
    console.error('Fetch error:', error);
    throw error;
  }
});

// ipcMain.on('request-applets', async (event) => {
//   const appletsPath = app.getPath('userData') + '/applets';

//   if (!fs.existsSync(appletsPath)) {
//     fs.mkdirSync(appletsPath, { recursive: true });
//     console.log(`Folder created: ${appletsPath}`);
//   }

//   const filenames = await fs.readdirSync(appletsPath);
//   const appletData = [];

//   for (let filename of filenames) {
//     const fileData = await fs.readFileSync(
//       `${appletsPath}/${filename}`,
//       'utf8'
//     );
//     appletData.push(fileData);
//   }
//   console.log(appletData);
//   mainWindow.webContents.send('applets', appletData);
// });

app.on('ready', createWindow);
app.on('window-all-closed', app.quit);
