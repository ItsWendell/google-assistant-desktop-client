import Artyom from 'artyom.js';
import { EventEmitter } from 'events';

/**
 * Handles & loads text commands, commands are loaded from files within this folder,
 * given as an array.
 */
export default class Commands extends EventEmitter {
	constructor() {
		super();
		this.artyom = new Artyom();
		this.commands = [];
		this.setup();
	}

	/** Loads commands from files within this folder. */
	setup() {
		const files = require.context('./', false, /\.js$/);
		let commandBuffer = [];
		files.keys().forEach((key) => {
			if (key === './index.js') return;
			// console.log('Commands from', key, ' file: ', files(key).default);
			commandBuffer = commandBuffer.concat(files(key).default);
		});
		this.commands = commandBuffer;
		this.artyom.addCommands(this.commands);
		this.emit('ready');
	}

	/**
	 * Run's a given command, function is a replicate of an Artyom function.
	 *
	 * @param {*} command
	 */
	static run(command) {
		if (typeof (command) === 'object') {
			if (command.instruction) {
				if (command.instruction.smart) {
					command.instruction.action(command.index, command.wildcard.item, command.wildcard.full);
				} else {
					command.instruction.action(command.index);
				}
				return true;
			}
			return false;
		}
		return false;
	}

	/**
	 * Finds a command given by a text sentence.
	 * @param string sentence
	 */
	findCommand(sentence) {
		return this.artyom.execute(sentence);
	}
}
