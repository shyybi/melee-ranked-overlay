const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')
const axios = require('axios')

let mainWindow; 

function createWindow () {
  mainWindow = new BrowserWindow({
    width: 400,
    height: 200,
    frame: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  mainWindow.loadFile('app/index.html');
}

app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

ipcMain.handle('make-request', async (event, url) => {
  try {
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la requête:', error);
    throw error;
  }
});
