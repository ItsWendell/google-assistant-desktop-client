<template>
	<div id="response">
		<iframe
			id="frame"
			ref="frameref"
			class="raw-response"
		/>
	</div>
</template>

<script>
import { ipcRenderer } from 'electron';
import jQuery from 'jquery';

export default {
	name: 'ResponseWindow',
	components: { },
	data: () => ({
	}),
	computed: {
	},
	mounted() {
		// Transfer window messages to main process.
		window.addEventListener('message', (event) => {
			console.log('Event message: ', event.data);
			ipcRenderer.send('message', event.data);
		});

		// Set response html into iframe
		ipcRenderer.on('response', (event, html) => {
			const responseFrame = jQuery('#frame');
			// console.log('response event:', event, html);
			responseFrame.get(0).srcdoc = html;
			setTimeout(() => {
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
	methods: {
	},
};
</script>

<style scoped>
.raw-response {
	width: 100%;
    height: 100vh;
	border: 0;
}
</style>
