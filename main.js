import { app, BrowserWindow } from 'electron';

function createWindow() {
  // Create the browser window.
  const win = new BrowserWindow({
    width: 1500,
    height: 1000,
    webPreferences: {
      nodeIntegration: true
    }
  });

  // Load a local HTML file or a web URL
  win.loadFile('index.html');
  // Or load a remote URL
  // win.loadURL('https://example.com');
}

app.whenReady().then(() => {
  setTimeout(createWindow, 2000);
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});