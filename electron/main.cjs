const { app, BrowserWindow, dialog, Menu, shell } = require('electron');
const path = require('path');

let mainWindow = null;
let lastSaveDir = null;

const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });
}

function buildMenu() {
  const template = [
    {
      label: 'Archivo',
      submenu: [
        { label: 'Salir', accelerator: 'Alt+F4', role: 'quit' },
      ],
    },
    {
      label: 'Editar',
      submenu: [
        { label: 'Deshacer', role: 'undo' },
        { label: 'Rehacer', role: 'redo' },
        { type: 'separator' },
        { label: 'Cortar', role: 'cut' },
        { label: 'Copiar', role: 'copy' },
        { label: 'Pegar', role: 'paste' },
        { label: 'Seleccionar todo', role: 'selectAll' },
      ],
    },
    {
      label: 'Ver',
      submenu: [
        { label: 'Recargar', role: 'reload' },
        { type: 'separator' },
        { label: 'Acercar', role: 'zoomIn' },
        { label: 'Alejar', role: 'zoomOut' },
        { label: 'Tamaño real', role: 'resetZoom' },
        { type: 'separator' },
        { label: 'Pantalla completa', role: 'togglefullscreen' },
      ],
    },
  ];
  return Menu.buildFromTemplate(template);
}

function createWindow() {
  const iconPath = path.join(__dirname, '../build/icon.png');

  mainWindow = new BrowserWindow({
    width: 1360,
    height: 860,
    minWidth: 960,
    minHeight: 680,
    title: 'Generador de Etiquetas PPTX',
    icon: iconPath,
    backgroundColor: '#f1f5f9',
    autoHideMenuBar: true,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  Menu.setApplicationMenu(buildMenu());

  mainWindow.once('ready-to-show', () => {
    if (mainWindow) {
      mainWindow.show();
    }
  });

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('http://') || url.startsWith('https://')) {
      shell.openExternal(url);
    }
    return { action: 'deny' };
  });

  mainWindow.webContents.session.on('will-download', (_event, item) => {
    const filename = item.getFilename() || 'archivo';
    const ext = path.extname(filename).toLowerCase();

    const filters = [];
    if (ext === '.pptx') {
      filters.push({ name: 'Presentación PowerPoint (*.pptx)', extensions: ['pptx'] });
    } else if (ext === '.py') {
      filters.push({ name: 'Script Python (*.py)', extensions: ['py'] });
    }
    filters.push({ name: 'Todos los archivos', extensions: ['*'] });

    const defaultDir = lastSaveDir || app.getPath('downloads');
    const savePath = dialog.showSaveDialogSync(mainWindow, {
      title: 'Guardar archivo generado',
      defaultPath: path.join(defaultDir, filename),
      filters,
    });

    if (savePath) {
      lastSaveDir = path.dirname(savePath);
      item.setSavePath(savePath);
    } else {
      item.cancel();
    }
  });

  const devUrl = process.env.VITE_DEV_SERVER_URL;
  if (devUrl) {
    mainWindow.loadURL(devUrl);
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

if (gotTheLock) {
  app.setAppUserModelId('com.sicosa.labelpptxgenerator');

  app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
      }
    });
  });

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });
}
