<template>
	<v-app
		id="action-bar"
		class="action-bar"
		dark>
		<v-card-actions>
			<v-text-field
				v-if="showActions && showTextField"
				ref="inputQuery"
				v-model="inputQuery"
				autofocus
				single-line
				full-width
				hide-details
				label="Type a message"
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
				<img src="static/ic_mic.png" />
			</v-btn>
			<div
				v-if="!showActions"
				class="loading-states">
				<img
					v-if="status === 'loading'"
					class="state-image"
					src="static/loading.gif"
				/>
				<img
					v-if="status === 'listening'"
					class="state-image"
					src="static/recording.gif"
				/>
				<v-btn
					v-if="status === 'unauthenticated'"
					fab
					dark
					small
					color="blue"
					@click="authenticate()"
				>
					<v-icon>fingerprint</v-icon>
				</v-btn>
			</div>
			<v-btn
				v-if="miniMode"
				icon
				@click="showChatWindow"
			>
				<v-icon color="primary">chat</v-icon>
			</v-btn>
		</v-card-actions>
	</v-app>
</template>

<script>
// eslint-disable-next-line
import { ipcRenderer } from 'electron';
import opn from 'opn';

import Authentication from '@/auth';
import Assistant from './assistant/index';

export default {
	name: 'AssistantWindow',
	components: { },
	data: () => ({
		inputQuery: '',
		miniMode: false,
		showTextField: false,
	}),
	computed: {
		status: () => Window.Store.state.assistant.status,
		messages: () => {
			if (Window.AssistantWindow) {
				return Window.Store.state.assistant.messages;
			}
			return [];
		},
		showActions: () => Window.Store.state.assistant.status === 'ready'
			|| Window.Store.state.assistant.status === 'waiting',
	},
	mounted() {
		ipcRenderer.on('start-assistant', () => {
			this.assist();
		});
		setTimeout(() => {
			// boot up the entire app!
				/** Registering global authenticator */
			Window.Auth = new Authentication();
			Window.Auth.once('authenticated', () => {
				console.log('Authenticated, setup up Google Assistant...');
				Window.Store.state.assistant.status = 'loading';
				Window.Assistant = new Assistant();
				Window.Assistant.on('ready', () => {
					console.log('The assistant is ready.');
					Window.Store.state.assistant.status = 'ready';
				});
				Window.Assistant.on('unauthorized', () => {
					Window.Auth.authenticate();
					Window.Store.state.assistant.status = 'waiting';
				});
				Window.Assistant.on('waiting', () => {
					Window.Store.state.assistant.status = 'waiting';
				});
				Window.Assistant.on('listening', () => {
					Window.Store.state.assistant.status = 'listening';
				});
				Window.Assistant.on('mini-mode', (enabled) => {
					this.miniMode = enabled;
				});
				Window.Assistant.on('responseHtml', (html) => {
					ipcRenderer.send('response', html);
				});
				Window.Assistant.authenticate();
			});

			Window.Auth.on('error', () => {
				Window.Store.state.assistant.status = 'unauthenticated';
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

		runScripts() {
			const scripts = this.$refs.response.getElementsByTagName('script');
			const len = scripts.length;
			for (let i = 0; i < len; i++) { // eslint-disable-line
				const scriptTag = scripts[i];
				const node = document.createElement('script');
				if (typeof scriptTag.src !== 'undefined') {
					node.src = scriptTag.src;
					node.type = scriptTag.type;
				} else {
					node.text = scriptTag.text;
					node.type = scriptTag.type;
					// had eval here before (instead of attaching the embedded script to the HEAD).
				}
				console.log('New script node:', node);
				document.head.appendChild(node);
				scriptTag.parentNode.remove(scriptTag);
			}
		},

		openURL(url) {
			opn(url);
		},

		clearInput() {
			this.inputQuery = '';
			this.showTextField = false;
		},

		authenticate() {
			Window.Auth.authenticate();
		},

		close() {
			ipcRenderer.send('close');
		},

		openurl(event) {
			event.preventDefault();
			console.log('open url event', event);
		},

		hideChatWindow() {
			Window.Assistant.setMiniMode(true);
		},

		showChatWindow() {
			Window.Assistant.setMiniMode(false);
		},

		settings() {
			Window.Assistant
				.say('Settings are coming soon for this Desktop client. Learn more about this project on Github.');

			setTimeout(() => {
				Window.Assistant.addMessage('https://github.com/WMisiedjan/GA-Desktop', 'incoming');
			}, 100);
		},

		reload() {
			ipcRenderer.send('reload');
		},
	},
};
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css?family=Roboto:100,200,300,400,500,700|Material+Icons");

@media screen and (max-height: 160px) {
    .main-card,
    .main-toolbar {
      display: none !important;
  }
}

.input-group--text-field.input-group--full-width {
    padding: 16px;
    padding-top: 0px;
    padding-bottom: 0px;
	margin-top: 4px;
}

.input-group--text-field label {
    position: absolute;
    top: 0px;
    left: 0;
}

.action-bar {
	height: fit-content !important;
}

.action-bar .application--wrap {
    min-height: auto;
}

.action-bar .card__actions {
	-webkit-app-region: drag !important;
	padding: 8px;
}

button.btn {
    -webkit-app-region: no-drag !important;
}

input[type="text"] {
    -webkit-app-region: no-drag !important;
}

.main-toolbar {
	-webkit-app-region: drag;
}

.theme--light .input-group:not(.input-group--error) label, .application .theme--light.input-group:not(.input-group--error) label {
    color: rgba(255, 255, 255, 0.54);
}

.main-toolbar button {
	-webkit-app-region: no-drag;
}
.loading-states {
    text-align: center;
    height: 50px;
    display: flex;
    flex-direction: column;
    justify-content: center;
	flex: 1;
}

.loading-states .btn {
	align-self: center;
}

img.state-image {
    align-self: center;
	width: auto;
    max-height: 40px;
}

.divider {
	max-height: 1px;
}
.card__actions .btn .btn__content img {
    width: 2rem;
}

.card__actions {
	flex: 0 0 auto;
}

	.raw-response {
		width: 100%;
		height: 100vh;
		flex: 1;
		border: 0;
	}

	.action-bar {
		position: absolute;
    z-index: 99999;
    bottom: 0;
    right: 0rem;
    height: 5rem;
    mix-blend-mode: lighten;
    background: rgb(35, 35, 35);
	}


  .centered
  {
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .logo
  {
    max-width: 14rem;
  }

  .link-btn
  {
    width: 150px;
  }

  .app-info {
    padding-top: 0px;
  }

  .hero h1 {
    margin: 0 auto;
    max-width: 880px;
    font-size: 42px;
    font-weight: 100;
  }

  .hero p {
    font-size: 20px;
    line-height: 32px;
    max-width: 430px;
    margin: 15px auto;
    font-weight: 300;
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

</style>
