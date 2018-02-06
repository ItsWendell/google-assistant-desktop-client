import metaget from 'metaget';

/**
 * Processor for external pages card.
 * Regex:
 * 1. Title
 * 2. Text
 * 3. URL
 */
export default {
	// regex: /(.*?)\. (.*)[\n| ]Wikipedia \( (.*) \)./g,
	regex: /(.*?\.)\s(.*[\n\s]*.*)[\n\s](.*)\s\(\s(.*)\s\)\./m,
	run: (text, regex) => {
		let message = {};
		const data = new RegExp(regex).exec(text);
		if (data !== null) {
			message = { text: data[2], url: { title: data[1], domain: 'wikipedia.org', url: data[4] } };
		} else {
			console.log('ERROr, cannot get data.', regex, text);
		}

		// Try getting an image, attach to latest message.
		metaget.fetch(data[4], (err, response) => {
			if (err) {
				console.log('Metaget: ', err);
				return;
			}

			if (response['og:image']) {
				console.log('OG IMAGE FOUND: ', response['og:image']);
				message.url.image = response['og:image'];
				Window.Store.commit('updateLatestMessage', message);
			} else {
				console.log('No OG IMAGE FOUND.');
			}
		});

		return message;
	},
};
