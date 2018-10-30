<template>
	<div id="response">
		<iframe
			id="frame"
			class="raw-response"
		/>
	</div>
</template>

<script>
import { ipcRenderer } from 'electron';
import jQuery from 'jquery';

export default {
	name: 'ResponseWindow',
	mounted() {
		// Transfer window messages to the main process
		window.addEventListener('message', (event) => {
			ipcRenderer.send('message', event.data);
		});

		// Incoming html response from the assistent window / process.
		ipcRenderer.on('response', (event, html) => {
			// Set the html content into the srcdoc of the iframe
			jQuery('#frame').get(0).srcdoc = html;
			// Wait half a second (so the iframe can load) before adding events
			// TODO: Find an event trigger?
			setTimeout(() => {
				// If being clicked outside of the assistant main cards, send an hide event to main process.
				jQuery('#assistant-main-cards', jQuery('#frame').get(0).contentDocument).click((e) => {
					e.stopPropagation();
				});

				jQuery('html', jQuery('#frame').get(0).contentDocument).click(() => {
					const eventOut = { event: { cardHide: true } };
					ipcRenderer.send('message', eventOut);
				});
			}, 500);
		});
	},
};
</script>

<style scoped>
#frame {
	width: 100%;
    height: 100vh;
	border: 0;
}
</style>
