// eslint-disable-next-line
import { ipcRenderer, remote } from 'electron';
// eslint-disable-next-line import/no-extraneous-dependencies
import { EventEmitter } from 'events';
import SpotifyAPIClient from 'spotify-web-api-node';
import fs from 'fs';
import mkdirp from 'mkdirp';
import path from 'path';
import config from '@/config';

export default class SpotifyClient extends EventEmitter {
	constructor() {
		super();
		this.spotifyClient = new SpotifyAPIClient(config.spotify.client);
		this.scopes = config.spotify.scopes;
		this.authenticationCode = '';
	}

	authenticate() {
		// [TODO]: Load saved tokens and use refresh token to get new tokens?
		this.spotifyAuthenticate();
	}

	spotifyAuthenticate() {
		this.authenticateApp().then((code) => {
			this.processAuthentication(code);
		}).catch((err) => {
			this.emit('unauthenticated', err);
		});
	}

	processAuthentication(code) {
		this.spotifyClient.authorizationCodeGrant(code)
			.then((data) => {
				console.log('The token expires in', data.body.expires_in);
				console.log('The access token is', data.body.access_token);
				console.log('The refresh token is', data.body.refresh_token);
				this.saveTokens(data.body);
				this.emit('authenticated', data.body);
			}, (err) => {
				this.emit('error', err);
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

			win.webContents.on('closed', () => {
				reject(new Error('User closed the window'));
			});

			win.webContents.on('did-get-redirect-request', (event, oldURL, newURL) => {
				const url = new URL(newURL);
				console.log('redirect urls', oldURL, newURL);
				const code = url.searchParams.get('code');
				if (code) {
					setImmediate(() => win.close());
					win.webContents.removeAllListeners('closed');
					console.log('Code found', code);
					resolve(code);
				}
			});
			win.loadURL(authURL);
		});
	}

	getMyCurrentPlayingTrack() {
		return new Promise((resolve, reject) => {
			this.spotifyClient.getMyCurrentPlayingTrack().then((response) => {
				resolve(response.body);
			}, (err) => {
				reject(err);
			});
		});
	}

	skipToNext() {
		return new Promise((resolve, reject) => {
			this.spotifyClient.skipToNext().then((response) => {
				console.log('skipped song to next...', response);
				resolve(response);
			}, (err) => {
				console.log('error??');
				reject(err);
			});
		});
	}

	shuffle(playTracks = true) {
		return new Promise((resolve, reject) => {
			this.spotifyClient.setShuffle({ state: true }).then((response) => {
				if (playTracks) {
					this.skipToNext();
				}
				resolve(response);
			}, (err) => {
				console.log('error??');
				reject(err);
			});
		});
	}

	play() {
		return new Promise((resolve, reject) => {
			this.spotifyClient.play().then((response) => {
				console.log('playing music', response);
				resolve(response);
			}, (err) => {
				console.log('error??');
				reject(err);
			});
		});
	}
}
