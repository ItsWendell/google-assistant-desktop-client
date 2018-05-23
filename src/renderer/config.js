// eslint-disable-next-line
import { remote } from 'electron';
import path from 'path';
import { installed as clientSecret } from './client_secret.json';

export default {
	auth: {
		/** [TODO]: Save tokens in local storage? */
		/** [TODO]: Better secure client secret in main process maybe? */
		key: clientSecret,
		keyFilePath: path.resolve(__dirname, 'client_secret.json'),
		savedTokensPath: path.join(remote.app.getPath('userData'), '/google.json'),
	},
	assistant: {
		audio: {
			sampleRateOut: 24000,
			sampleRateIn: 16000,
			encodingIn: 'LINEAR16',
			encodingOut: 'MP3',
		},
		lang: 'en-US',
		deviceId: 'ga-desktop',
		deviceModelId: 'ga-desktop-electron',
		screen: {
			isOn: true,
		},
	},
	spotify: {
		clientId: '84286ed53eaf4370b812263004b40c10',
		clientSecret: 'a92ed06c4b0e413bb6ba39f0e21c1da6',
		redirectUri: 'https://ga-desktop.local/callback',
		scopes: [
			'user-read-private',
			'user-read-email',
			'user-top-read',
			'user-library-read',
			'user-read-currently-playing',
			'user-modify-playback-state',
			'user-read-playback-state',
			'streaming',
		],
		savedTokensPath: path.join(remote.app.getPath('userData'), '/spotify.json'),
	},
};
