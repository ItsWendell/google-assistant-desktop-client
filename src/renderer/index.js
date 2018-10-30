/* eslint-disable */
import 'babel-polyfill';

import Vue from 'vue';
import VueElectron from 'vue-electron';
import Vuetify from 'vuetify';
import axios from 'axios';


import 'vuetify/dist/vuetify.css';

import AssistantWindow from './containers/assistant';
import ResponseWindow from './containers/response';

import Vuex from 'vuex';

import store from './providers/store';
import SpotifyClient from './providers/spotify';

Vue.use(VueElectron);
Vue.use(Vuetify);
Vue.use(Vuex);

Vue.http = Vue.prototype.$http = axios;
Vue.config.productionTip = false;

Window.Store = store;

if (Window.isAssistant) {
	Window.Spotify = new SpotifyClient();

	Window.AssistantWindow = new Vue({
		components: { AssistantWindow },
		store,
		el: '#assistant',
		template: '<AssistantWindow />',
	});
}

if (Window.isResponse) {
	Window.ResponseWindow = new Vue({
		components: { ResponseWindow },
		store,
		el: '#response',
		template: '<ResponseWindow />',
	});
}
