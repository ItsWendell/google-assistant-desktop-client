import { EventEmitter } from 'events';
import config from '@/config';
import fs from 'fs';
import mkdirp from 'mkdirp';
import path from 'path';
import { auth as GoogleAuth } from 'googleapis';
import ElectronGoogleOAuth from './google';

/**
 * OAuth2 Authenticator for Electron.
 *
 * This Authenticator saves the tokens locally and refreshes them if nessesay,
 * it's specially made for Electron use.
 */
export default class Authenticator extends EventEmitter {
	constructor() {
		super();

		const { OAuth2 } = GoogleAuth;
		this.OAuth2Client = new OAuth2(
			config.google.key.client_id,
			config.google.key.client_secret,
			config.google.key.redirect_uris[0],
		);
		this.inProcess = false;
	}

	// [TODO]: Save authentication information in LocalStorage.
	authenticate() {
		/** Check if we have existing credentials saved */
		let fileContents;
		let credentials;
		(async () => {
			console.debug('Authenticating...');
			try {
				console.debug('Checking for existing tokens...');
				fileContents = fs.readFileSync(config.google.savedTokensPath, 'utf8');
				if (fileContents) {
					credentials = JSON.parse(fileContents);
					if (credentials.refresh_token) {
						console.log('Existing tokens found');
						this.OAuth2Client.credentials = credentials;
						// [TODO]: Check timestamp on file and check validity of token?
						this.OAuth2Client.refreshAccessToken((err, tokens) => {
							this.refreshAccessToken(err, tokens);
						});
					} else {
						this.googleAuthenticate();
					}
				} else {
					console.debug('No tokens found!');
					this.googleAuthenticate();
				}
			} catch (err) {
				console.log('Error reading file', err);
				this.googleAuthenticate();
			}
		})();
	}

	refreshAccessToken(err, tokens) {
		console.log('Refreshing access token...');
		if (err || !tokens) {
			console.log('Error refreshing tokens...', err, tokens);
			this.googleAuthenticate();
		} else {
			this.saveTokens(tokens);
			this.processAuthentication(tokens);
		}
	}
	/**
	 * Opens a Google popup to authenticate.
	 */
	googleAuthenticate() {
		const googleOauth = new ElectronGoogleOAuth();

		(async () => {
			try {
				console.log('Opening Google Window...');
				this.inProcess = false;
				// retrieve access token and refresh token
				const result = await googleOauth.getAccessToken(
					['https://www.googleapis.com/auth/assistant-sdk-prototype'],
					config.google.key.client_id,
					config.google.key.client_secret,
					config.google.key.redirect_uris[0],
				);
				this.inProcess = true;
				this.saveTokens(result);
				this.processAuthentication(result);
			} catch (err) {
				console.log('Something went wrong with authenticating, try again.');
				this.inProcess = false;
				this.emit('error', err);
			}
		})();
	}

	/**
	 * Saves the given tokens.
	 *
	 * [TODO]: Save tokens in localStorage instead of a local file.
	 * @param {*} tokens
	 */
	saveTokens(tokens) {
		this.OAuth2Client.credentials = tokens;
		console.log('Saving tokens...', tokens);
		mkdirp(path.dirname(config.google.savedTokensPath), () => {
			fs.writeFile(config.google.savedTokensPath, JSON.stringify(tokens), (err) => {
				if (!err) {
					console.debug('Tokens saved.');
				} else {
					console.debug('error saving tokens');
				}
			});
		});
	}

	/**
	 * Processes the given credentials.
	 * @param {*} credentials
	 */
	processAuthentication(credentials) {
		console.log('processing credentials.');
		this.OAuth2Client.credentials = credentials;
		this.emit('authenticated', this.OAuth2Client);
	}

	/**
	 * Removes the locally saved tokens.
	 */
	static resetTokens() {
		fs.writeFile(config.google.savedTokensPath, '', () => console.log('tokens reset'));
	}
}
