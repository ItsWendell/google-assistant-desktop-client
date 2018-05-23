<template>
	<v-app
		id="action-bar"
		class="action-bar"
		dark>
		<div id="toolbar">
			<v-text-field
				v-if="showActions && showTextField"
				id="text-query"
				ref="inputQuery"
				v-model="inputQuery"
				autofocus
				single-line
				full-width
				solo
				hide-details
				placeholder="Type a message"
				@keyup.enter="assist"
			/>
			<v-btn
				v-if="showActions"
				icon
				@click="toggleTextField"
			>
				<v-icon>chat</v-icon>
			</v-btn>
			<v-btn
				v-if="showActions"
				icon
				@click="assist"
			>
				<img
					v-if="status !== 'listening'"
					src="static/ic_mic.png" />
				<v-icon v-else>hearing</v-icon>
			</v-btn>
		</div>
	</v-app>
</template>

<script>
import { ipcRenderer } from 'electron';

import Authentication from '@/auth';
import Assistant from './assistant/index';

export default {
	name: 'AssistantWindow',
	components: { },
	data: () => ({
		inputQuery: '',
		showTextField: false,
		status: 'loading',
	}),
	computed: {
		showActions: () => this.status !== 'loading',
	},
	mounted() {
		ipcRenderer.on('start-assistant', () => {
			Window.Assistant.player.playPing();
			this.assist();
		});
		setTimeout(() => {
			// boot up the entire app!
				/** Registering global authenticator */
			Window.Auth = new Authentication();
			Window.Auth.once('authenticated', () => {
				console.log('Authenticated, setup up Google Assistant...');
				this.status = 'loading';
				Window.Assistant = new Assistant();
				Window.Assistant.on('ready', () => {
					console.log('The assistant is ready.');
					this.status = 'ready';
				});
				Window.Assistant.on('unauthorized', () => {
					Window.Auth.authenticate();
					this.status = 'waiting';
				});
				Window.Assistant.on('waiting', () => {
					this.status = 'waiting';
				});
				Window.Assistant.on('listening', () => {
					this.status = 'listening';
				});
				Window.Assistant.on('responseHtml', (html) => {
					ipcRenderer.send('response', html);
				});
				Window.Assistant.authenticate();
			});

			Window.Auth.on('error', () => {
				this.status = 'unauthenticated';
			});

			Window.Auth.authenticate();
		}, 0);
	},
	methods: {
		assist() {
			if (Window.Assistant) {
				if (this.inputQuery) {
					Window.Assistant.assist(this.inputQuery);
					this.clearInput();
				} else {
					Window.Assistant.assist();
				}
			}
		},

		toggleTextField() {
			this.showTextField = !this.showTextField;
			if (this.showTextField) {
				ipcRenderer.send('textToolbar');
			} else {
				ipcRenderer.send('miniToolbar');
			}
		},

		clearInput() {
			this.inputQuery = '';
			this.toggleTextField();
		},

		authenticate() {
			Window.Auth.authenticate();
		},
	},
};
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css?family=Roboto:100,200,300,400,500,700|Material+Icons");

#toolbar .btn .btn__content img {
    width: 2rem;
}

#app,
.application--wrap {
	background-color: rgba(0, 0, 0, 0) !important;
	background: rgba(0, 0, 0, 0) !important;
}

html {
	overflow-y: hidden;
	-webkit-app-region: drag;
}

#toolbar {
	display: flex;
    justify-content: center;
    align-items: center;
    align-content: center;
    align-self: center;
	flex: 1;
}

#toolbar > .input-group {
	padding: 0 !important;
	background-color: transparent !important;
	flex: 1;
}

</style>
