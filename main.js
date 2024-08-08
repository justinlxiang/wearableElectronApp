const { app, BrowserWindow } = require('electron');
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

let mainWindow; // Add a global reference to the main window

// Use process.resourcesPath to ensure correct paths in packaged app
const fullPathToAppPy = path.join(process.resourcesPath, 'app.py');
const fullPathToProxy = path.join(process.resourcesPath, 'proxyServer.js');

function createWindow () {
  mainWindow = new BrowserWindow({
    width: 1500,
    height: 1000,
    webPreferences: {
      nodeIntegration: true
    }
  });

  mainWindow.loadFile("index.html");
  mainWindow.webContents.openDevTools();

  mainWindow.on('closed', function () {
    mainWindow = null; // Dereference the window object
  });
}

app.whenReady().then(() => {  
  try {
    exec(`python ${fullPathToAppPy}`, (error, stdout, stderr) => {
      if (error) {
        console.error(`Failed to spawn Python server: ${error.message}`);
        return;
      }
      if (stderr) {
        console.error(`Python server error: ${stderr}`);
        return;
      }
      console.log(`Python server: ${stdout}`);
    });
  } catch (error) {
    console.error(`Failed to execute Python server: ${__dirname}`);
  }
  
  try {
    exec(`node ${fullPathToProxy}`, (error, stdout, stderr) => {
      if (error) {
        console.error(`Failed to spawn Node server: ${error.message}`);
        return;
      }
      if (stderr) {
        console.error(`Node server error: ${stderr}`);
        return;
      }
      console.log(`Node server: ${stdout}`);
    });
  } catch (error) {
    console.error(`Failed to execute Node server: ${__dirname}`);
  }

  createWindow();

});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    exec('lsof -ti:5000 | xargs kill -9', (error, stdout, stderr) => {
      if (error) {
        console.error(`Error shutting down servers on port 5000: ${error.message}`);
        return;
      }
      if (stderr) {
        console.error(`stderr on port 5000: ${stderr}`);
        return;
      }
      console.log(`stdout on port 5000: ${stdout}`);
    });

    exec('lsof -ti:3000 | xargs kill -9', (error, stdout, stderr) => {
      if (error) {
        console.error(`Error shutting down servers on port 3000: ${error.message}`);
        return;
      }
      if (stderr) {
        console.error(`stderr on port 3000: ${stderr}`);
        return;
      }
      console.log(`stdout on port 3000: ${stdout}`);
    });

    app.quit();
  }
});