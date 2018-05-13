<template>
	<div id="response">
		<iframe
			ref="responseframe"
			class="raw-response"
		/>
	</div>
</template>

<script>
// eslint-disable-next-line
import { ipcRenderer } from 'electron';

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
			console.log('response event:', event, html);
			this.$refs.responseframe.srcdoc = html;
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
