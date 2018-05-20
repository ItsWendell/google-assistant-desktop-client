// eslint-disable-next-line
import { ipcRenderer, remote } from 'electron';
import { EventEmitter } from 'events';
import GoogleAssistant from 'google-assistant';

import Configuration from '@/config';

import Commands from '@/commands';

import Player from './player';
import Microphone from './microphone';

export default class Assistant extends EventEmitter {
	constructor() {
		super();

		/** Audio player for Google Assistant responses */
		this.player = new Player();

		/** Microphone class build to transform the browser microphone to an output that's ready for google. */
		this.microphone = new Microphone(Configuration.assistant.audio.sampleRateIn);

		/** Processor for commands */
		this.commands = new Commands();

		/** The assistant library we use to process everything and connect to Google */
		this.assistant = undefined;

		this.responseWindow = undefined;

		this.conversation = undefined;

		ipcRenderer.on('message', (event, message) => {
			console.log('Message from childeren:', message, event);
			if (message.query) {
				this.assist(message.query.queryText);
			}
		});

		this.startConversation = (conversation) => {
			this.conversation = conversation;
			console.log('[Assistant SDK]', 'Starting conversation...');

			console.log(
				'Starting conversation, type: ',
				Configuration.assistant.textQuery ? 'textQuery' : 'voice input',
				Configuration.assistant.textQuery,
			);

			if (Configuration.assistant.textQuery === undefined) {
				this.emit('listening');
				this.microphone.enabled = true;
			}

			conversation.on('audio-data', (data) => {
				if (this.disableOutput) return;

				console.log('incoming audio buffer...');
				this.player.appendBuffer(Buffer.from(data));
			});

			conversation.on('end-of-utterance', () => {
				this.microphone.enabled = false;
				this.emit('waiting');
			});

			conversation.on('device-action', (data) => {
				console.log('Device action: ', data);
			});

			conversation.on('transcription', ({ transcription, done }) => {
				console.log('Transcription: ', transcription, done);
				if (done) {
					this.emit('waiting');
					this.microphone.enabled = false;
					this.runCommand(transcription);
				}
			});

			conversation.on('response', (text) => {
				if (this.disableOutput) return;
				console.log('Response: ', text);
			});

			conversation.on('screen-data', ({ format, data }) => {
				if (this.disableOutput) return;

				switch (format) {
				case 'HTML':
					this.updateResponseWindow(data.toString());
					break;
				default:
					console.log('Error: unknown data format.');
				}
			});

			conversation.on('ended', (error = undefined, followOn = false) => {
				console.debug('[Assistant SDK]', 'Conversation ended...');
				this.followOn = !Configuration.assistant.textQuery ? followOn : false;
				Configuration.assistant.textQuery = undefined;

				if (error) {
					console.log('Conversation error', error);
				}

				this.emit('ready');
			});
		};

		/** Registers if we need to follow on the input we've given */
		this.followOn = false;

		/** Store if current action is a command */
		this.disableOutput = false;

		this.player.on('ready', () => console.log('Audio player ready...'));

		this.microphone.on('data', (data) => {
			const buffer = Buffer.from(data);
			if (this.conversation) {
				this.conversation.write(buffer);
			}
		});

		this.microphone.on('ready', () => console.log('Microphone ready...'));

		// Event for when the assistant stopped talking
		this.player.on('waiting', () => this.onAssistantFinishedTalking());
		/** Registering events for registered services */
	}

	/** Triggers when the audio player has stopped playing audio. */
	onAssistantFinishedTalking() {
		console.log('Google Assistant audio stopped.');
		if (this.followOn) {
			console.log('Follow on required.');
			this.followOn = false;
			this.stopConversation();
			this.assist();
		}
	}

	updateResponseWindow(html) {
		this.emit('responseHtml', html);
	}

	ask(question) {
		return new Promise((resolve) => {
			console.log('[Assistant Client]', 'Starting ask:', question);
			if (question) {
				this.assistant.once('started', () => {
					this.conversation.once('ended', () => {
						console.log('[Assistant Client] Question asked, waiting until audio output is finished...');
						this.player.once('waiting', () => {
							console.log('[Assistant Client]', 'Audio output finished, waiting for answer...');
							// Checking if response expected is from text input or audio input!!
							if (Configuration.assistant.textQuery) {
								// Expecting Text Input[Assistant Client]
								console.log('[Assistant Client]', 'Text question response not supported yet!');
								return;
							}
							this.microphone.enabled = true;
							this.assist();
							this.conversation.removeAllListeners('transcription')
								.on('transcription', ({ transcription, done }) => {
									this.disableOutput = true;
									console.info('[Assistant Client] Answer - Speech Results:', transcription);
									if (done) {
										console.info('[Assistant Client] Final Answer:', transcription);
										this.disableOutput = false;
										this.stopConversation(true).then(() => {
											resolve(transcription);
										});
									}
								});
						});
					});
				});
				this.disableOutput = false;
				this.microphone.enabled = false;
				this.say(question);
			}
		});
	}

	/**
	 * Let's the Google Assistant say a given sentence.
	 *
	 * @param string sentence
	 * @param int Delay in seconds
	 */
	say(sentence, delay = 0) {
		console.log('[Assistant Client]', 'Saying:', sentence);
		setTimeout(() => {
			this.stopConversation(true).then(() => {
				console.log('[Assistant Client]', 'Saying:', sentence);
				this.disableOutput = false;
				this.microphone.enabled = false;
				this.assist(`repeat after me ${sentence}`, false);
			});
		}, 1000 * delay);
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
	assist(inputQuery = null, checkCommands = true) {
		if (inputQuery) {
			this.emit('waiting');
			if (checkCommands) {
				if (this.runCommand(inputQuery)) {
					return;
				}
			}
			Configuration.assistant.textQuery = inputQuery;
			this.assistant.start(Configuration.assistant);
		} else {
			this.emit('loading');
			Configuration.assistant.textQuery = undefined;
			this.assistant.start(Configuration.assistant);
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
			if (!queueCommand) {
				console.log('[Commands] Executing command...');
				if (Commands.run(command)) {
					console.log('executing command done.');
					this.emit('ready');
				}
			} else {
				console.log('executing command after session.');
				this.conversation.once('ended', () => {
					console.log('ready for command...');
					if (Commands.run(command)) {
						console.log('command finished!');
						this.emit('ready');
					}
				});
				this.stopConversation(true);
			}
			return true;
		}
		console.log('no command found.');
		return false;
	}

	/** Stops the microphone output and plays what's left in the buffer (if any) */
	stopConversation(forceStop = false) {
		return new Promise((resolve) => {
			console.log('[Assistant Client]', 'Stopping conversation...');

			this.microphone.enabled = false;
			this.disableOutput = forceStop ? true : this.disableOutput;

			if (!this.conversation) resolve();

			this.conversation.once('ended', () => {
				console.log('[Assistant Client]', 'Conversation stopped...');
				this.conversation = undefined;
				resolve();
			});

			if (forceStop) {
				this.player.reset();
			} else {
				this.player.play();
			}

			this.conversation.end();
		});
	}

	/**
	 * Sets up the Google Assistant for Electron.
	 * @param {*} OAuth2Client
	 */
	authenticate() {
		this.assistant = new GoogleAssistant(Configuration.auth);
		this.assistant.on('ready', () => {
			console.log('[Assistant SDK]', 'Ready...');
			this.emit('ready');
		});

		this.assistant.on('error', (error) => {
			console.log('[Assistant SDK]', error);
		});

		this.assistant.on('started', this.startConversation);
	}
}
