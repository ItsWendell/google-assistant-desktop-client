<template>
	<v-card
		d-flex
		class="elevation-4 conversation-card">
		<v-toolbar
			card
			color="white"
			prominent
			class="main-toolbar"
		>
			<div class="toolbar-title">
				<img
					class="powered-by-google"
					src="static/powered_by_google_light.png" />
			</div>
			<v-spacer />
			<v-btn
				icon
				@click="reload()">
				<v-icon>autorenew</v-icon>
			</v-btn>
			<v-btn
				icon
				@click="settings()">
				<v-icon>settings</v-icon>
			</v-btn>
			<v-btn
				icon
				@click="openURL('https://assistant.google.com/explore')">
				<v-icon>explore</v-icon>
			</v-btn>
			<v-btn
				icon
				@click="hideChatWindow()">
				<v-icon>minimize</v-icon>
			</v-btn>
			<v-btn
				icon
				@click="close()">
				<v-icon>close</v-icon>
			</v-btn>
		</v-toolbar>

		<v-card-text class="main-card text-xs-center">
			<div class="app-info text-xs-center ma-1">
				<conversation />
			</div>
		</v-card-text>

		<v-divider v-if="showActions" />

		<v-card-actions>
			<v-text-field
				ref="inputQuery"
				autofocus
				single-line
				full-width
				hide-details
				label="Type a message"
				v-model="inputQuery"
				@keyup.enter="assist"
				v-if="showActions"
			/>
			<v-btn
				icon
				@click="assist"
				v-if="showActions"
			>
				<img src="static/ic_mic.png" />
			</v-btn>
			<div
				class="loading-states"
				v-if="!showActions">
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
	</v-card>
</template>

<script>
// eslint-disable-next-line
import { ipcRenderer } from 'electron';
import opn from 'opn';

import Authentication from '@/auth';
import Assistant from '@/assistant';
import Conversation from './Conversation';

export default {
	name: 'Assistant',
	components: { Conversation },
	data: () => ({
		inputQuery: '',
		miniMode: false,
	}),
	computed: {
		status: () => Window.Store.state.assistant.status,
		messages: () => {
			if (Window.App) {
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
			Window.Auth.once('authenticated', (OAuth2Client) => {
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
				Window.Assistant.setup();
				Window.Assistant.authenticate(OAuth2Client);
				ipcRenderer.send('ready-to-show');
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

		openURL(url) {
			opn(url);
		},

		clearInput() {
			this.inputQuery = '';
		},

		authenticate() {
			Window.Auth.authenticate();
		},

		close() {
			ipcRenderer.send('close');
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

<style>
@media screen and (max-height: 160px) {
    .main-card,
    .main-toolbar {
      display: none !important;
  }

.card__actions {
    -webkit-app-region: drag !important;
}

button.btn {
    -webkit-app-region: no-drag !important;
}

input[type="text"] {
    -webkit-app-region: no-drag !important;
}
}

.main-toolbar {
	-webkit-app-region: drag;
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

.conversation-card .toolbar__content {
    height: 3rem;
}

.conversation-card {
	border-radius: 10px;
}

.conversation-card .card__actions .input-group--text-field.input-group--full-width {
    padding: 0 16px;
}

.conversation-card .card__actions .input-group--text-field label {
    top: 0;
}

img.powered-by-google {
    height: 1rem;
}

.v-card-header {
    text-align: center;
    margin-top: 0.35rem;
    flex: 0 0 auto;
}

  .state-image {
    max-width: 35%;
  }

  .speech-result--unstable {
    opacity: 0.35;
  }
  body,
  div#app,
  html {
	height: 100%;
	overflow: hidden;
}

  /** From Google */

  .conversation__bubble { display: block; position: relative; -ms-transform: translateY(700px); transform: translateY(700px); transition: transform 0.6s cubic-bezier(0.2, 0, 0.2, 1), opacity 0.5s; will-change: transform; }

.conversation__bubble.conversation__bubble__intl { -ms-transform: translateY(210px); transform: translateY(210px); transition: transform 0.6s cubic-bezier(0.2, 0, 0.2, 1), opacity 0.5s; }

.conversation__bubble.conversation__bubble__intl.is-active { -ms-transform: translateY(0); transform: translateY(0); }

.conversation__bubble.conversation__bubble__intl.is-active .conversation__molecule { opacity: 1; }

.conversation__bubble--user, .conversation__bubble--user2 { text-align: right; z-index: 1; }

.conversation__bubble--user .bubble, .conversation__bubble--user2 .bubble { margin-right: 10px; text-align: left; }

@media only screen and (max-width: 400px) { .conversation__bubble--user .bubble, .conversation__bubble--user2 .bubble { margin-right: 0; } }

.homepage .conversation__bubble--user .bubble, .homepage .conversation__bubble--user2 .bubble { margin-right: 0; }

@media only screen and (min-width: 1140px) { .homepage .conversation__bubble--user .bubble, .homepage .conversation__bubble--user2 .bubble { margin-right: 20px; } }

.conversation__bubble--user2 { text-align: left; }

.conversation__bubble--assistant .bubble { margin-left: 75px; }

@media only screen and (min-width: 1140px) { .conversation__bubble--assistant .bubble { margin-left: 70px; top: 0; }
  .homepage .conversation__bubble--assistant .bubble { margin-left: 65px; } }

@media only screen and (max-width: 800px) { .conversation__bubble--assistant .bubble { margin-left: 60px; }
  .homepage .conversation__bubble--assistant .bubble { margin-left: 42px; } }

@media only screen and (max-width: 400px) { .conversation__bubble--assistant .bubble { margin-left: 46px; }
  .homepage .conversation__bubble--assistant .bubble { margin-left: 32px; } }

.conversation__bubble--replay { margin-top: 80px; opacity: 0; text-align: center; -ms-transform: none; transform: none; }

@media only screen and (max-width: 800px) { .conversation__bubble--replay { display: none; } }

.conversation__bubble--replay.is-active { opacity: 1; }

.conversation__bubble.is-active { -ms-transform: translateY(0); transform: translateY(0); }

.conversation__bubble.is-active .conversation__molecule { opacity: 1; }

.conversation__bubble.has-gap { margin-top: 75px; }

.conversation__bubble.is-leaving { opacity: .5; }

@media only screen and (max-width: 800px) { .conversation__bubble.is-leaving { opacity: 1; } }

.conversation__bubble .bubble { vertical-align: middle; }

.conversation__bubble .at-google { color: #858585; }

.conversation__card { border-radius: 2px; display: block; margin-top: 0; opacity: 0; -ms-transform: translateY(700px); transform: translateY(700px); transition: opacity 1.2s, transform 1s cubic-bezier(0.2, 0, 0.2, 1); width: auto; }

.conversation__card.conversation__card__intl { -ms-transform: translateY(210px) !important; transform: translateY(210px) !important; }

@media only screen and (min-width: 1140px) { .conversation__card { width: auto; } }

@media only screen and (max-width: 800px) { .conversation__card { width: 250px; } }

@media only screen and (max-width: 400px) { .conversation__card { width: 203px; } }

.conversation__card.is-active { opacity: 1; -ms-transform: translateY(0); transform: translateY(0); width: 100%; }

@media only screen and (min-width: 1140px) { .homepage .conversation__card.is-active { margin-left: -17px; } }

@media only screen and (max-width: 800px) { .homepage .conversation__card.is-active { width: 270px; } }

@media only screen and (max-width: 800px) { .homepage .conversation__card { margin-top: 0; } }

@media only screen and (max-width: 1139px) { .homepage .conversation__card { margin-top: 20px; } }

@media only screen and (max-width: 800px) { .homepage .conversation__card { margin-top: 0; } }

.conversation__card--multi { box-shadow: none; font-size: 0; }

.conversation__card--multi img { box-shadow: 0 3px 8px rgba(0, 0, 0, 0.18); display: inline-block; width: 30%; }

.conversation__card--multi img:nth-child(2) { margin: 0 5%; }

.conversation__face { display: inline-block; margin-right: 10px; opacity: 0; transition: opacity .75s; vertical-align: middle; }

@media only screen and (min-width: 1700px) { .conversation__face { margin-left: 13px; margin-right: 25px; } }

@media only screen and (max-width: 800px) { .conversation__face { margin-right: 1px; } }

.help-bubbles__bubble.is-active .conversation__face { opacity: 1; }

.conversation__face img { height: 50px; width: 50px; }

.conversation__annotation { color: #8c8c8c; font-size: 12px; font-style: italic; font-weight: 300; margin-bottom: 5px; margin-left: 55px; opacity: 0; text-align: right; transition: opacity .75s .3s; width: 305.063px; }

@media only screen and (max-width: 800px) { .conversation__annotation { margin-left: 48px; width: 249.597px; } }

@media only screen and (min-width: 1700px) { .conversation__annotation { margin-left: 92px; width: 374.3955px; } }

@media only screen and (max-width: 400px) { .conversation__annotation { margin-left: 32px; width: 194.131px; } }

.help-bubbles__bubble.is-active .conversation__annotation { opacity: 1; }

.conversation__molecule { display: inline-block; height: 105px; left: -18px; opacity: 0; position: absolute; top: -18px; transition: opacity .75s; vertical-align: middle; width: 105px; z-index: -1; }

@media only screen and (min-width: 1140px) { .conversation__molecule { top: -24px; } }

@media only screen and (max-width: 800px) { .conversation__molecule { height: 85px; left: -16px; margin-top: 10px; top: -24px; width: 85px; } }

@media only screen and (max-width: 400px) { .conversation__molecule { height: 65px; left: -12px; top: -18px; width: 65px; } }

.conversation__molecule { height: 65px; left: 0; top: 10px; width: 65px; }

@media only screen and (min-width: 1140px) { .conversation__molecule { left: -15px; } }

@media only screen and (max-width: 800px) { .conversation__molecule { height: 35px; left: 0; top: 0; width: 35px; } }

@media only screen and (max-width: 400px) { .conversation__molecule { left: -10px; } }

@media only screen and (min-width: 1140px) { .conversation__molecule .molecule { background-size: 90%; } }

.conversation__molecule .molecule { background-size: 115%; }

.bubble {
    background: #fff;
    border: 1.1px solid #e0e0e0;
    border-radius: 16.5px;
    color: #212121;
    display: inline-block;
    font-family: "Product Sans", sans-serif;
    font-size: 18px;
    font-weight: 400;
    letter-spacing: .5px;
    line-height: 24px;
    margin: 10px 0;
    max-width: 268px;
    padding: 10px 15px;
    transition: opacity .75s;
}

.bubble--filled, .bubble--user, .bubble--user2 {
    background: #e0e0e0;
}

.info-card {
    margin: 0.5rem;
    border-radius: 0.5rem;
}

.info-card .card__actions {
    display: block;
    padding: 1rem;
	flex: 0 0 auto;
}

.info-card a {
    color: #ea4335;
    text-decoration: none;
}

.conversation-card {
	display: flex !important;
	flex-direction: column;
}

.main-card {
	flex: 1 1 auto;
    position: relative;
    overflow-y: auto;
	display: flex;
    flex-direction: column-reverse;
}
</style>
