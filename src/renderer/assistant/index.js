// eslint-disable-next-line
import { ipcRenderer } from 'electron';
import { EventEmitter } from 'events';
import GoogleAssistant from 'google-assistant-node';

import Configuration from '@/config';
import store from '@/store';

import Commands from '@/commands';
import Cards from './cards';

import Player from './player';
import Microphone from './microphone';

export default class Assistant extends EventEmitter {
	constructor(OAuth2Client = null) {
		super();

		/** Authentication client */
		this.OAuth2Client = OAuth2Client;

		/** Audio player for Google Assistant responses */
		this.player = new Player();

		/** Microphone class build to transform the browser microphone to an output that's ready for google. */
		this.microphone = new Microphone(Configuration.assistant.input.sampleRateHertz);

		/** Processor for commands */
		this.commands = new Commands();

		/** The assistant library we use to process everything and connect to Google */
		this.assistant = new GoogleAssistant(Configuration.assistant);

		/** Text-processor for incoming messages from Google */
		this.cards = new Cards();

		/** Registers if we need to follow on the input we've given */
		this.followOn = false;

		/** Store if current action is a command */
		this.command = false;

		/** Registering events for registered services */

		// Event for when the assistant stopped talking
		this.player.on('waiting', () => this.onAssistantFinishedTalking());
		// Event for when we receive input from the microphone, sending it to the Google Assistant.
		this.microphone.on('data', data => this.assistant.writeAudio(data));
		// Event for when the microphone is ready with registering.
		this.microphone.on('ready', () => console.log('Microphone ready...'));
		// Event for when the card processor nodes have been loaded.
		this.cards.on('ready', () => console.log('cards ready...'));
	}

	/** Triggers when the audio player has stopped playing audio. */
	onAssistantFinishedTalking() {
		console.log('Google Assistant audio stopped.');
		if (this.followOn) {
			console.log('Follow on required.');
			this.followOn = false;
			this.reset();
		}
	}

	/** Stops the assistant and starts directly a new assist / conversation */
	reset() {
		this.stop();
		this.assist();
	}

	/**
	 * Let's the Google Assistant say a given sentence.
	 *
	 * @param string sentence
	 * @param int Delay in seconds
	 */
	say(sentence, delay = 0) {
		setTimeout(() => {
			if (this.state === 0) this.stop();
			if (sentence) {
				this.addMessage(sentence, 'incoming');
				this.assistant.say(sentence);
			}
		}, 1000 * delay);
	}

	/**
	 * Adds a message to the global assistant store to display in the UI
	 *
	 * @param string text
	 * @param string type
	 */
	addMessage(text, type) {
		this.command = null;
		const message = this.processMessage(text, type);
		store.commit('addMessage', message);
		return message;
	}

	// [TODO]: Move processing of messages to another class?
	/**
	 * Processes & formats an incoming message from the assistant into a proper output.
	 *
	 * @param {*} text
	 * @param {*} type
	 */
	processMessage(text, type) {
		const message = { text, type };

		if (type !== 'incoming') {
			return message;
		}

		const returnMessage = this.cards.getMessage(text);
		console.log(returnMessage);
		return returnMessage;
	}

	/** Authenticates the Google Assistant with a Google OAuth2Client */
	authenticate(OAuth2Client) {
		console.log('Starting assistant with this client; ', OAuth2Client);
		this.assistant.authenticate(OAuth2Client);
		this.emit('ready'); // [TODO]: Only fire ready when ALL assistant elements are loaded?
	}

	playPing() {
		this.player.playPing();
	}

	/**
	 * Sends a request to Google Assistant to start audio streaming
	 * or for the text input given in the arguemnt
	 *
	 * @param {*} inputQuery
	 */
	assist(inputQuery = null) {
		// this.player.reset();
		if (inputQuery) {
			this.emit('waiting');
			this.addMessage(inputQuery, 'outgoing', true);
			if (!this.runCommand(inputQuery)) {
				this.assistant.assist(inputQuery);
			}
		} else {
			this.emit('loading');
			this.assistant.assist();
		}
	}

	/**
	 * Sets the mini mode for the assistant.
	 * @param {*} enabled
	 */
	setMiniMode(enabled) {
		if (enabled && !this.miniMode) {
			this.miniMode = true;
			ipcRenderer.send('mini-mode', true);
			this.emit('mini-mode', true);
		} else if (!enabled && this.miniMode) {
			this.miniMode = false;
			ipcRenderer.send('mini-mode', false);
			this.emit('mini-mode', false);
		}
	}

	/**
	 * Run's a command based on the input text query
	 * @param {*} textQuery
	 * @param {*} queueCommand Queue the command when the assistant has ended current converstion.
	 */
	runCommand(textQuery, queueCommand = false) {
		console.log('Checking if"', textQuery, '"is a command.');
		const command = this.commands.findCommand(textQuery);
		if (command) {
			console.log('Command found.', command);
			this.command = command;
			if (!queueCommand) {
				console.log('executing command directly.');
				if (Commands.run(this.command)) {
					console.log('executing command done.');
					this.emit('ready');
				}
			} else {
				console.log('executing command after session.');
				this.assistant.once('end', () => {
					console.log('ready for command...');
					if (Commands.run(this.command)) {
						console.log('command finished!');
						this.emit('ready');
					}
				});
				this.forceStop();
			}
			return true;
		}
		return false;
	}

	/** Stops the microphone output and plays what's left in the buffer (if any) */
	stop() {
		this.microphone.enabled = false;
		this.player.play();
	}

	/** Force stops the assistant & audio and it's connection to Google. */
	forceStop() {
		console.log('Force stopping the assistant & players...');
		this.assistant.stop();
		this.microphone.enabled = false;
		this.player.stop();
	}

	/**
	 * Sets up the Google Assistant for Electron.
	 * @param {*} OAuth2Client
	 */
	setup(OAuth2Client = null) {
		this.OAuth2Client = OAuth2Client;

		/** Adds audio data from assistant to player buffer. */
		this.assistant.on('audio-data', (data) => {
			if (!this.command) {
				console.log('incoming audio buffer...');
				this.player.appendBuffer(data);
			} else {
				console.log('cancel command reponse audio...');
			}
		});

		/** Processes text response if last message wasn't a command, if it is
		 * an command it cancels the adding to the conversation, since commands will handle
		 * this response themselves.
		 */
		this.assistant.on('response-text', (text) => {
			if (!this.command) {
				this.emit('ready');
				this.addMessage(text, 'incoming');
			} else {
				console.log('cancel command reponse text...');
			}
		});

		/** Triggered when audio input was stopped */
		this.assistant.on('end-of-utterance', () => {
			console.info('End of utterance.');
		});

		/** A speech-result of the given audio input to the assistant, if stability = 1
		 * means we got the final message. Adds non-final messages to the speechTextBuffer
		 * in the store so we can still display them to the user
		  */
		this.assistant.on('speech-results', (results) => {
			if (results && results.length) {
				console.info('Speech Results', results);
				if (results.length === 1 && results[0].stability === 1) {
					this.addMessage(results[0].transcript, 'outgoing');
					Window.Store.state.assistant.speechTextBuffer = [];
					this.runCommand(results[0].transcript, true);
					this.microphone.enabled = false;
					this.emit('waiting');
				} else {
					Window.Store.state.assistant.speechTextBuffer = results;
				}
				this.emit('new-text');
			}
		});

		/**
		 * Device action's / requests are limited right now, this is why we've build in custom commands.
		 * This might become handy in the future.
		 */
		this.assistant.on('device-request', (request) => {
			// [TODO]: Implement device requests support.
			console.log('Device action detected.');
			console.log(request);
		});

		/**
		 * This is the assistant connection telling is if we need to continue streaming the micrphone or not
		 * We cancel this first because it's once of the first events fired.
		 */
		this.assistant.on('mic-mode', (mode) => {
			// [TODO]: Continue microphone when mic-mode != 0 / same thing as follow-on
			console.info('mic-mode', mode);
			if (mode === 1) {
				this.microphone.enabled = false;
			}
			if (this.command) {
				this.forceStop();
			}
		});

		/**
		 * Assistant notices that the given OAuth2Client is not valid anymore, we emit this back to the app
		 * so we can reauthenticate.
		 */
		this.assistant.on('unauthorized', () => {
			this.emit('unauthorized');
		});

		/**
		 * Error handeling for the assistant, since the quota for v1alpha2 is 'only' 500 requests we'll print it
		 * when this happens, if not we'll write it to console.
		 */
		this.assistant.on('error', (error) => {
			if (error.toString().startsWith('Error: Insufficient tokens for quota')) {
				this.addMessage('Whooppsss, quota reached. Try again later.', 'incoming');
			} else {
				console.log(error);
			}
		});

		/**
		 * Google ASsistant API tells us to continue doing this conversation because it requires
		 * a follow on answer.
		 * [TODO]: Properly handle follow-on's.
		 */
		this.assistant.on('follow-on', () => {
			console.log('Follow-on.');
			this.followOn = true;
		});

		/**
		 * Google Assistant will emit this when the assistant is ready for the audio input of the microphone.
		 */
		this.assistant.on('ready', (textQuery) => {
			if (!textQuery) {
				console.log('Ready for microphone stream.');
				this.microphone.enabled = true;
				this.playPing();
				this.emit('listening');
			}
		});

		/**
		 * Google Assistant will trigger this when all it has ended it conversation. We'll tell the app that
		 * the assistant is 'ready' for a new conversation.
		 */
		this.assistant.on('end', () => {
			if (this.followOn) {
				this.followOn = false;
				this.assist();
			}
			this.player.play();
			this.emit('ready');
		});
	}
}
