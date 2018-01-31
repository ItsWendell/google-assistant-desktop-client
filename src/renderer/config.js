import GoogleAssistant from 'google-assistant-node';
// eslint-disable-next-line
import { remote } from 'electron';
import path from 'path';
import { installed as clientSecret } from './client_secret.json';

const encodings = GoogleAssistant.Constants.Encoding;

export default {
	auth: {
		/** [TODO]: Save tokens in local storage? */
		/** [TODO]: Better secure client secret in main process maybe? */
		key: clientSecret,
		savedTokensPath: path.join(remote.app.getPath('userData'), '/tokens.json'),
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
};
