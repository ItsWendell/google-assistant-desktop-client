import { EventEmitter } from 'events';

// -*\s*(.*?)\s\(map:\s(.*?);end\)\s(.*?)\s\((.*?)\) --- Phone: (.*?) Address: (.*?)($|\s) | - Google Maps

/**
 * Handler class to process text into specific Google Cards formats.
 *
 * Create formats for new cards into this folder as a seperate file.
 */
export default class TextFilters extends EventEmitter {
	constructor() {
		super();
		this.filters = [];
		this.setup();
		this.URL_REGEX = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_+.~#?&//=]*)/mg;
	}

	/**
	 * Loads text filters from current folder.
	 */
	setup() {
		const files = require.context('./', false, /\.js$/);
		files.keys().forEach((key) => {
			if (key === './index.js') return;
			this.filters.push(files(key).default);
		});
		console.log('Loaded text filters:', this.filters);
		this.emit('ready');
	}

	getMessage(text) {
		const filter = this.filters.find(filterObject => new RegExp(filterObject.regex).test(text));

		if (filter) {
			const message = filter.run(text, filter.regex);
			message.type = 'incoming';
			return message;
		}

		return this.filterUrls(text);
	}

	filterUrls(text) {
		let message = {};
		let textResult = text;
		let hyperlink;
		const results = new RegExp(this.URL_REGEX);
		hyperlink = results.exec(text);
		while (hyperlink !== null) {
			console.log(`Found ${hyperlink[0]}. Next starts at ${hyperlink.lastIndex}.`);
			textResult = textResult.replace(hyperlink[0], `<a href="${hyperlink[0]}" onclick='openurl'>${hyperlink[0]}</a>'`);
			hyperlink = results.exec(text);
		}
		message = { text: textResult, type: 'incoming' };
		return message;
	}
}
