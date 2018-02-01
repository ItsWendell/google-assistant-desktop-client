// eslint-disable-next-line
import { ipcRenderer, remote } from 'electron';
// eslint-disable-next-line import/no-extraneous-dependencies
import { EventEmitter } from 'events';
import SpotifyAPIClient from 'spotify-web-api-node';
import fs from 'fs';
import mkdirp from 'mkdirp';
import path from 'path';
import config from '@/config';

export default class Assistant extends EventEmitter {
	constructor() {
		super();
		this.spotifyClient = new SpotifyAPIClient(config.spotify.client);
		this.scopes = config.spotify.scopes;
		this.authenticationCode = '';
	}

	authenticate() {
		this.authenticateApp().then((code) => {
			this.processAuthentication(code);
		}).catch((err) => {
			this.emit('Spotify authentication error', err);
		});
	}

	processAuthentication(code) {
		this.spotifyClient.authorizationCodeGrant(code)
			.then((data) => {
				console.log('The token expires in', data.body.expires_in);
				console.log('The access token is', data.body.access_token);
				console.log('The refresh token is', data.body.refresh_token);
				this.saveTokens();
				this.emit('authenticated');
			}, (err) => {
				console.log('Something went wrong!', err);
			});
	}

	saveTokens(tokens) {
		this.spotifyClient.setAccessToken(tokens.access_token);
		this.spotifyClient.setRefreshToken(tokens.refresh_token);
		mkdirp(path.dirname(config.spotify.savedTokensPath), () => {
			fs.writeFile(config.spotify.savedTokensPath, JSON.stringify(tokens), (err) => {
				if (!err) {
					console.debug('Tokens saved.');
				} else {
					console.debug('error saving tokens');
				}
			});
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
