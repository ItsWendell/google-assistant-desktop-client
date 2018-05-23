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
		this.spotifyClient = new SpotifyAPIClient({
			clientId: config.spotify.clientId,
			clientSecret: config.spotify.clientSecret,
			redirectURri: config.spotify.redirectUri,
		});
		this.scopes = config.spotify.scopes;
	}

	/**
	 * Fetches the tokens and saves them.
	 *
	 * @param {String} code
	 */
	handleAuthorization(code) {
		this.spotifyClient.authorizationCodeGrant(code)
			.then(({ body: tokens }) => {
				this.spotifyClient.setAccessToken(tokens.access_token);
				this.spotifyClient.setRefreshToken(tokens.refresh_token);
				console.debug('The token expires in', tokens.expires_in);
				console.debug('The access token is', tokens.access_token);
				console.debug('The refresh token is', tokens.refresh_token);
				this.saveTokens(tokens);
				this.emit('authenticated', tokens);
			}, (err) => {
				this.emit('error', err);
			});
	}

	/**
	 * Saves the tokens from the included spotify web api client.
	 */
	saveTokens() {
		const tokens = {
			access_token: this.spotifyClient.getAccessToken(),
			refresh_token: this.spotifyClient.getRefreshToken(),
		};
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

	requestAuthorizationCode() {
		const { BrowserWindow } = remote;
		const authenticationUrl = this.spotifyClient.createAuthorizeURL(this.scopes);

		console.debug('[Spotify Client] Requesting Authorization code...', authenticationUrl);

		return new Promise((resolve, reject) => {
			const win = new BrowserWindow({
				webPreferences: {
					nodeIntegration: false,
					webSecurity: false,
				},
			});

			win.webContents.on('closed', () => {
				reject(new Error('User closed the window'));
			});

			/** Detect redirects to find the code parameter for RedirectUri */
			win.webContents.on('did-get-redirect-request', (event, oldURL, newURL) => {
				console.log('[Spotify Client] Found redirection in BrowserWindow.');
				console.log('[Spotify Client] From:', oldURL, '| To:', newURL);

				/** Only process the url when we find the url that starts with our redirectUri */
				if (!newURL.startsWith(config.spotify.client.redirectUri)) {
					return;
				}

				const url = new URL(newURL);

				const code = url.searchParams.get('code');


				if (code) {
					setImmediate(() => win.close());
					win.webContents.removeAllListeners('closed');
					console.log('[Spotify Client] Code found', code);
					resolve(code);
				} else {
					reject(new Error(`No token found at redirectUri ${newURL}`));
				}
			});
			win.loadURL(authenticationUrl);
		});
	}

	authenticate() {
		// [TODO]: Load saved tokens and use refresh token to get new tokens?
		console.debug('[Spotify Client] Authenticating current user...');
		this.requestAuthorizationCode().then((code) => {
			this.handleAuthorization(code).then(() => {
				this.handleAuthorization(code);
			}).catch((err) => {
				this.emit('unauthenticated', err);
			});
		}).catch((err) => {
			this.emit('unauthenticated', err);
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
