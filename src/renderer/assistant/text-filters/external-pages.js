import metaget from 'metaget';

/**
 * Processor for external pages card.
 * Regex:
 * 1. Title
 * 2. Domain
 * 3. URL
 */
export default {
	regex: /From: "(.*)" \( (.*) - (.*) \)\n---\n(.*)/g,
	run: (text, regex) => {
		let message = {};
		const data = new RegExp(regex).exec(text);
		if (data !== null) {
			message = { text: data[4], url: { title: data[1], domain: data[2], url: data[3] } };
		} else {
			console.log('ERROr, cannot get data.', regex, text);
		}

		// Try getting an image, attach to latest message.
		metaget.fetch(data[3], (err, response) => {
			if (err) {
				console.log('Metaget: ', err);
				return;
			}

			if (response['og:image']) {
				message.url.image = response['og:image'];
				// [TODO]: Find a better way to track dynamic changes to cards.
				Window.Store.commit('updateLatestMessage', message);
			}
		});

		return message;
	},
};
