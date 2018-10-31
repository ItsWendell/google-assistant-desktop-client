import {
	app,
	BrowserWindow,
	ipcMain,
	globalShortcut,
	screen,
	Tray,
} from 'electron';
import path from 'path';
import os from 'os';

if (process.env.NODE_ENV === 'development') {
	try {
		// eslint-disable-next-line
		require('electron-debug')({
			showDevTools: 'undocked',
		});
	} catch (err) {
		console.log('Failed to install `electron-debug`');
	}
} else {
	global.__static = path.join(__dirname, '/static').replace(/\\/g, '\\\\');
}

/** @type {BrowserWindow} */
let assistantWindow;
/** @type {BrowserWindow} */
let responseWindow;
/** @type {Tray} */
let mainTray;

const miniToolbarSize = {
	width: 104,
	height: 52,
};

const textToolbarSize = {
	width: 326,
	height: 52,
};

/**
 * Set the size of the toolbar / assistant window.
 *
 * @param {Object} size Information about the user.
 * @param {Number} size.width The name of the user.
 * @param {Number} size.height {Number} The email of the user.
 * @returns {undefined}
 */
function setToolbarSize({ width, height }) {
	if (!assistantWindow) return;

	assistantWindow.setSize(width, height, true);
	assistantWindow.setPosition(
		screen.getPrimaryDisplay().workAreaSize.width - width,
		screen.getPrimaryDisplay().workAreaSize.height - height,
	);
}

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
 * Registers the application tray icon.
 *
 * @returns {Undefined}
 */
function registerTrayIcon() {
	const platform = os.platform();
	const imageFolder = global.__static ? global.__static : path.join('static');
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
		assistantWindow.show();
	});
}

function registerEvents() {
	ipcMain.on('message', (event, message) => {
		console.log('Incoming Message: ', message);

		if (!assistantWindow) return;

		assistantWindow.webContents.send('message', message);
		if (message.event && message.event.cardHide && responseWindow) {
			responseWindow.hide();
			assistantWindow.setAlwaysOnTop(false);
		}
	});

	ipcMain.on('response', (event, html) => {
		if (!responseWindow) return;
		responseWindow.webContents.send('response', html);
		responseWindow.show();
		assistantWindow.setAlwaysOnTop(true);
	});

	ipcMain.on('miniToolbar', () => {
		setToolbarSize(miniToolbarSize);
	});

	ipcMain.on('textToolbar', () => {
		setToolbarSize(textToolbarSize);
	});
}

/**
 * Creates the main application window.
 */
function createWindows() {
	/** Assistant core and toolbar */
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

	/** Response window will be hidden until needed */
	responseWindow = new BrowserWindow({
		height: screen.getPrimaryDisplay().workAreaSize.height,
		width: screen.getPrimaryDisplay().workAreaSize.width,
		show: false,
		frame: false,
		resizable: false,
		y: 0,
		x: 0,
		transparent: true,
		useContentSize: true,
	});

	assistantWindow.on('closed', () => {
		assistantWindow = null;
	});

	responseWindow.on('closed', () => {
		responseWindow = null;
	});

	assistantWindow.on('ready-to-show', () => {
		assistantWindow.show();
	});

	assistantWindow.loadURL(assistantURL);
	responseWindow.loadURL(responseURL);
	assistantWindow.webContents.openDevTools();
}


function initializeApp() {
	createWindows();
	registerEvents();
	registerTrayIcon();
	registerShortcuts();
}

// NOTE: Setting a timeout here fixes the issues for linux transparency!
app.on('ready', () => setTimeout(initializeApp, 100));

app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') {
		app.quit();
	}
});

app.on('activate', () => {
	if (assistantWindow === null || responseWindow === null) {
		assistantWindow = null;
		responseWindow = null;
		initializeApp();
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
