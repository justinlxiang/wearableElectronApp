const { app, BrowserWindow, nativeImage} = require('electron');
const { exec, spawn} = require('child_process');
const fs = require('fs');
const path = require('path');

let mainWindow;
function createWindow () {
  mainWindow = new BrowserWindow({
    width: 1500,
    height: 1000,
    webPreferences: {
      nodeIntegration: true
    }
  });

  mainWindow.loadFile("index.html");
  // mainWindow.webContents.openDevTools();

  mainWindow.on('closed', function () {
    mainWindow = null; // Dereference the window object
  });
}

app.whenReady().then(() => {  
  const image = nativeImage.createFromPath(
    app.getAppPath() + "/images/icon.png"
  );
  app.dock.setIcon(image);

  const userDataPath = app.getPath('userData');
  const pythonExecutable = path.join(__dirname, '../bin/pyApp');
  const pythonProcess = spawn(pythonExecutable, [userDataPath]);

  const logFilePath = path.join(app.getPath('userData'), 'error_log.txt');

  pythonProcess.stdout.on('data', (data) => {
    const stdoutMessage = `Python stdout: ${data}\n`;
    fs.appendFileSync(logFilePath, stdoutMessage);
  });

  pythonProcess.stderr.on('data', (data) => {
    const stderrMessage = `Python stderr: ${data}\n`;
    fs.appendFileSync(logFilePath, stderrMessage);
  });

  pythonProcess.on('error', (error) => {
    const errorMessage = `Python executable process exited with error: ${error.message}\n`;
    fs.appendFileSync(logFilePath, errorMessage);
    fs.appendFileSync(logFilePath, `Stack trace:\n${error.stack}\n`);
    if (mainWindow) {
      mainWindow.webContents.send('python-error', error.message); // Send error to renderer process
    }
  });

  const proxyExecutable = path.join(__dirname, '../bin/proxyServer');
  const proxyProcess = spawn(proxyExecutable);

  proxyProcess.stdout.on('data', (data) => {
    const stdoutMessage = `Proxy stdout: ${data}\n`;
    fs.appendFileSync(logFilePath, stdoutMessage);
  });

  proxyProcess.stderr.on('data', (data) => {
    const stderrMessage = `Proxy stderr: ${data}\n`;
    fs.appendFileSync(logFilePath, stderrMessage);
  });

  proxyProcess.on('error', (error) => {
    const errorMessage = `Proxy server process exited with error: ${error.message}\n`;
    fs.appendFileSync(logFilePath, errorMessage);
    fs.appendFileSync(logFilePath, `Stack trace:\n${error.stack}\n`);
    if (mainWindow) {
      mainWindow.webContents.send('python-error', error.message); // Send error to renderer process
    }
  });

  app.on('activate', function () {
      if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
      }
  });

  createWindow();
});
 

function shutdownServers() {
  exec('lsof -ti:5000,3000 | xargs kill -9', (error, stdout, stderr) => {
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
}

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    shutdownServers();
    app.quit();
  }
});

app.on('quit', function () {
  shutdownServers();
});
