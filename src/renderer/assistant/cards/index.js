import { EventEmitter } from 'events';

// -*\s*(.*?)\s\(map:\s(.*?);end\)\s(.*?)\s\((.*?)\) --- Phone: (.*?) Address: (.*?)($|\s) | - Google Maps

/**
 * Handler class to process text into specific Google Cards formats.
 *
 * Create formats for new cards into this folder as a seperate file.
 */
export default class Cards extends EventEmitter {
	constructor() {
		super();
		this.cards = [];
		this.setup();
	}

	setup() {
		const files = require.context('./', false, /\.js$/);
		files.keys().forEach((key) => {
			if (key === './index.js') return;
			this.cards.push(files(key).default);
		});
		console.log('cards loaded;', this.cards);
		this.emit('ready');
	}

	getMessage(text) {
		const foundCard = this.cards.find(card => new RegExp(card.regex).test(text));

		// Card found, running the cards processor.
		if (foundCard) {
			const message = foundCard.getMessage(text, foundCard.regex);
			message.type = 'incoming';
			return message;
		}

		console.log('No card found :(');
		// Card not found, returning default message.
		const type = 'incoming';
		return { text, type };
	}
}
