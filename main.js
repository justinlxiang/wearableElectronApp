const { app, BrowserWindow } = require('electron');
const { exec, spawn } = require('child_process'); // Add spawn here
var child = require('child_process').execFile;

const path = require('path');

let mainWindow; // Add a global reference to the main window
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
  // child(path.join(__dirname, '../bin/pyApp'), function(err, data){
  //   if(err){
  //     console.log(err);
  //     return;
  //   }
  //   console.log(data.toString());
  // });
  const pythonExecutable = path.join(__dirname, '../bin/pyApp');
  let pythonProcess;
  try {
    pythonProcess = spawn(pythonExecutable);
  } catch (error) {
    console.error(`Failed to spawn Python process: ${error}`);
  }

  pythonProcess.stdout.on('data', (data) => {
    console.log(`stdout: ${data}`);
  });

  pythonProcess.stderr.on('data', (data) => {
    console.error(`stderr: ${data}`);
  });

  pythonProcess.on('close', (code) => {
    if (code !== 0) {
      console.error(`Python executable process exited with code ${code}`);
      if (mainWindow) {
        mainWindow.close();
      }
      app.quit();
    }
  });

  const proxyExecutable = path.join(__dirname, '../bin/proxyServer');
  const proxyProcess = spawn(proxyExecutable);

  proxyProcess.stdout.on('data', (data) => {
    console.log(`stdout: ${data}`);
  });

  proxyProcess.stderr.on('data', (data) => {
    console.error(`stderr: ${data}`);
  });

  proxyProcess.on('close', (code) => {
    if (code !== 0) {
      console.error(`Proxy server process exited with code ${code}`);
    }
  });

  createWindow();
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
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

    app.quit();
  }
});