import { app, BrowserWindow, ipcMain, globalShortcut, screen, Tray } from 'electron' // eslint-disable-line
import path from 'path';
import os from 'os';

/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== 'development') {
  global.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\') // eslint-disable-line
}

let mainWindow;
let mainTray;
let mainWidth = 400;
let mainHeight = 600;

const winURL = process.env.NODE_ENV === 'development'
  ? 'http://localhost:9080'
	: `file://${__dirname}/index.html`;

/**
 * Registers the application shortcodes.
 */
function registerShortcuts() {
	globalShortcut.register('CommandOrControl+Option+A', () => {
		mainWindow.show();
		mainWindow.webContents.send('start-assistant');
		// [TODO]: Play activation sound
	});
}

/**
 * Registers the application tray icon
 */
function registerTrayIcon() {
	const platform = os.platform();
	let imageFolder;
	// eslint-disable-next-line
	if (global.__static) {
		// eslint-disable-next-line
		imageFolder = global.__static;
	} else {
		imageFolder = path.join('static');
	}
	let trayImage;
	// Determine appropriate icon for platforms
	if (platform === 'darwin' || platform === 'linux') {
		trayImage = path.join(imageFolder, '/icon.png');
	} else if (platform === 'win32') {
		trayImage = path.join(imageFolder, '/icon.ico');
	}
	mainTray = new Tray(trayImage);
	mainTray.setToolTip('Google Assistant For Desktop');
	mainTray.on('click', () => {
		if (!mainWindow.isVisible()) {
			mainWindow.show();
		} else {
			mainWindow.hide();
		}
	});
}

/**
 * Sets the position of the application near the tray icon.
 */
function setPosition() {
	const bounds = mainTray.getBounds();
	const { x, y } = bounds;
	mainWindow.setPosition(x - (mainWidth / 2), y - mainHeight);
}

/**
 * Creates the main application window.
 */
function createWindow() {
	registerTrayIcon();

	ipcMain.on('minimize', () => {
		mainWindow.hide();
	});

	ipcMain.on('close', () => {
		mainWindow.close();
	});

	ipcMain.on('mini-mode', (event, enabled) => {
		const position = mainWindow.getPosition();
		// [TODO]: Check if we need to expand upwards or downwards, and if the window is out of bounds.
		if (enabled) {
			const { 0: width, 1: height } = mainWindow.getSize();
			mainWidth = width;
			mainHeight = height;
			mainWindow.setResizable(false);
			mainWindow.setSize(mainWidth, 60);
			mainWindow.setPosition(position[0], position[1] + (height - 60));
		} else {
			mainWindow.setResizable(true);
			mainWindow.setPosition(position[0], position[1] - (mainHeight - 60));
			mainWindow.setSize(mainWidth, mainHeight);
			mainWindow.setResizable(true);
		}
	});

	ipcMain.on('reload', () => {
		mainWindow.webContents.reloadIgnoringCache();
	});

  /**
   * Initial window options
   */
	mainWindow = new BrowserWindow({
		height: mainHeight,
		width: mainWidth,
		useContentSize: true,
		show: false,
		frame: false,
		transparent: true,
		resizable: true,
	});

	mainWindow.on('closed', () => {
		mainWindow = null;
	});

	mainWindow.on('ready-to-show', () => {
		mainWindow.show();
	});

	mainWindow.loadURL(winURL);
	// mainWindow.webContents.openDevTools();
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') {
		app.quit();
	}
});

app.on('activate', () => {
	if (mainWindow === null) {
		createWindow();
		registerShortcuts();
		setPosition();
	}
});


/**
 * Auto Updater
 *
 * Uncomment the following code below and install `electron-updater` to
 * support auto updating. Code Signing with a valid certificate is required.
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-electron-builder.html#auto-updating
 */

/*
import { autoUpdater } from 'electron-updater'

autoUpdater.on('update-downloaded', () => {
  autoUpdater.quitAndInstall()
})

app.on('ready', () => {
  if (process.env.NODE_ENV === 'production') autoUpdater.checkForUpdates()
})
 */
