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

let assistantWindow;
let responseWindow;
let mainTray;
const mainWidth = 400;
const mainHeight = 600;

const assistantURL = process.env.NODE_ENV === 'development'
  ? 'http://localhost:9080/assistant.html'
	: `file://${__dirname}/assistant.html`;

const responseURL = process.env.NODE_ENV === 'development'
  ? 'http://localhost:9080/response.html'
	: `file://${__dirname}/response.html`;

/**
 * Registers the application shortcodes.
 */
function registerShortcuts() {
	globalShortcut.register('CommandOrControl+Option+A', () => {
		assistantWindow.show();
		assistantWindow.webContents.send('start-assistant');
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
		if (!assistantWindow.isVisible()) {
			assistantWindow.show();
		} else {
			assistantWindow.hide();
		}
	});
}

/**
 * Sets the position of the application near the tray icon.
 */
function setPosition() {
	const bounds = mainTray.getBounds();
	const { x, y } = bounds;
	assistantWindow.setPosition(x - (mainWidth / 2), y - mainHeight);
}

/**
 * Creates the main application window.
 */
function createWindow() {
	registerTrayIcon();

	ipcMain.on('message', (event, message) => {
		console.log('Incoming Message: ', message);
		assistantWindow.webContents.send('message', message);
		if (message.event) {
			if (message.event.cardHide) {
				if (responseWindow) {
					responseWindow.hide();
				}
			}
		}
	});

	ipcMain.on('response', (event, html) => {
		responseWindow.webContents.send('response', html);
		responseWindow.show();
	});

	ipcMain.on('miniToolbar', () => {
		assistantWindow.setSize(104, 52, true);
		assistantWindow.setPosition(
			screen.getPrimaryDisplay().workAreaSize.width - 104,
			screen.getPrimaryDisplay().workAreaSize.height - 52,
		);
	});

	ipcMain.on('textToolbar', () => {
		assistantWindow.setSize(326, 52, true);
		assistantWindow.setPosition(
			screen.getPrimaryDisplay().workAreaSize.width - 326,
			screen.getPrimaryDisplay().workAreaSize.height - 52,
		);
	});


  /**
   * Assistant window toolbar & core
   */
  // Basic: 104 x 52
	// text-input: 326 x 52
	assistantWindow = new BrowserWindow({
		height: 52,
		width: 104,
		show: true,
		frame: false,
		y: screen.getPrimaryDisplay().workAreaSize.height - 52, //  - (mainHeight + 32)
		x: screen.getPrimaryDisplay().workAreaSize.width - 104,
		transparent: true,
		resizable: true,
		useContentSize: true,
		fullscreenable: true,
	});

	/**
   * Response Window
   */
	responseWindow = new BrowserWindow({
		height: screen.getPrimaryDisplay().workAreaSize.height - 50,
		width: screen.getPrimaryDisplay().workAreaSize.width,
		show: false,
		frame: false,
		y: 50,
		x: 0,
		transparent: true,
		resizable: false,
		useContentSize: true,
	});

	assistantWindow.on('closed', () => {
		assistantWindow = null;
	});

	responseWindow.on('closed', () => {
		assistantWindow = null;
	});

	assistantWindow.on('ready-to-show', () => {
		assistantWindow.show();
	});

	assistantWindow.loadURL(assistantURL);
	responseWindow.loadURL(responseURL);
	// assistantWindow.webContents.openDevTools();
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') {
		app.quit();
	}
});

app.on('activate', () => {
	if (assistantWindow === null) {
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
