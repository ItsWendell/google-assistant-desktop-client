import GoogleAssistant from 'google-assistant-node';
// eslint-disable-next-line
import { remote } from 'electron';
import path from 'path';
import { installed as clientSecret } from './client_secret.json';

const encodings = GoogleAssistant.Constants.Encoding;

export default {
	google: {
		/** [TODO]: Save tokens in local storage? */
		/** [TODO]: Better secure client secret in main process maybe? */
		key: clientSecret,
		savedTokensPath: path.join(remote.app.getPath('userData'), '/google.json'),
	},
	assistant: {
		input: {
			encoding: encodings.LINEAR16,
			sampleRateHertz: 16000,
		},
		output: {
			encoding: encodings.MP3,
			sampleRateHertz: 24000,
			volumePercentage: 100,
		},
		languageCode: 'en-US',
		device: {
			deviceId: 'ga-desktop',
			deviceModelId: 'ga-desktop-electron',
		},
	},
	spotify: {
		client: {
			clientId: '84286ed53eaf4370b812263004b40c10',
			clientSecret: 'a92ed06c4b0e413bb6ba39f0e21c1da6',
			redirectUri: 'https://localhost/',
		},
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
