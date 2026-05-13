const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { exec } = require('child_process');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    title: "HelpDesk TI - Portal Administrativo",
    icon: path.join(__dirname, 'icon.png'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  // En desarrollo carga el puerto de Vite, en producción el archivo build
  const startUrl = process.env.NODE_ENV === 'development' 
    ? 'http://localhost:5173' 
    : `file://${path.join(__dirname, '../helpdesk-frontend/dist/index.html')}`;

  mainWindow.loadURL(startUrl);
}

// HANDLER: Ejecución de comandos de Sistema Operativo
ipcMain.handle('execute-action', async (event, action) => {
  return new Promise((resolve, reject) => {
    let command = '';
    switch (action) {
      case 'clean':
        command = 'del /q /s %temp%\\* && rd /s /q %temp% && mkdir %temp%';
        break;
      case 'spooler':
        command = 'net stop spooler && del /Q /F /S "%systemroot%\\System32\\Spool\\Printers\\*.*" && net start spooler';
        break;
      case 'ram':
        command = 'taskkill /F /FI "STATUS eq NOT RESPONDING"';
        break;
      default:
        return reject({ message: "Acción no reconocida" });
    }

    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error ejecutando ${action}:`, error);
        return reject({ message: `Error: ${error.message}` });
      }
      resolve({ 
        message: `Operación ${action} completada exitosamente.`, 
        output: stdout || stderr 
      });
    });
  });
});

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
