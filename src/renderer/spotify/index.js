// eslint-disable-next-line
import { ipcRenderer, remote } from 'electron';
// eslint-disable-next-line import/no-extraneous-dependencies
import { EventEmitter } from 'events';
import SpotifyAPIClient from 'spotify-web-api-node';
import configuration from '@/config';

export default class Assistant extends EventEmitter {
	constructor() {
		super();
		this.spotifyClient = new SpotifyAPIClient(configuration.spotify.client);
		this.scopes = configuration.spotify.scopes;
		this.authenticationCode = '';
	}

	authenticate() {
		this.authenticateApp().then(() => {
			console.log('Spotify Succes!');
		}).catch(() => {
			console.log('Spotify error!');
		});
	}

	authenticateApp() {
		const { BrowserWindow } = remote;
		const authURL = this.spotifyClient.createAuthorizeURL(this.scopes, 'login');
		return new Promise((resolve, reject) => {
			const win = new BrowserWindow({ 'use-content-size': true });

			win.on('closed', () => {
				reject(new Error('User closed the window'));
			});

			win.webContents.on('did-get-redirect-request', (event, oldURL, newURL) => {
				const url = new URL(newURL);
				const code = url.searchParams.get('code');
				if (code) {
					setImmediate(() => win.close());
					console.log('Code found', code);
					resolve(code);
				} else {
					console.log('fail load info: ', newURL, oldURL);
				}
			});

			win.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
				const url = new URL(validatedURL);
				const code = url.searchParams.get('code');
				if (code) {
					setImmediate(() => win.close());
					console.log('Code found', code);
					resolve(code);
				} else {
					console.log('fail load info: ', errorCode, errorDescription, validatedURL);
				}
			});

			win.loadURL(authURL);
		});
	}
}
