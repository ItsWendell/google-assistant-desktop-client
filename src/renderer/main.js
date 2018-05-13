/* eslint-disable */
import 'babel-polyfill';

// eslint-disable-next-line
import { ipcRenderer } from 'electron';

import Vue from 'vue';
import axios from 'axios';
import Vuetify from 'vuetify';

import 'vuetify/dist/vuetify.css';

import AssistantWindow from './Assistant';
import ResponseWindow from './Response';

import Vuex from 'vuex';
import store from './store';

import SpotifyClient from './spotify';


Vue.use(Vuetify);
Vue.use(Vuex);

if (!process.env.IS_WEB) Vue.use(require('vue-electron'));
Vue.http = Vue.prototype.$http = axios;
Vue.config.productionTip = false;

Window.Store = store;

Window.Spotify = new SpotifyClient();

/* eslint-disable no-new */
const assistantWindow = new Vue({
	components: { AssistantWindow },
	store,
	el: '#assistant',
	template: '<AssistantWindow />',
});

/* eslint-disable no-new */
const responseWindow = new Vue({
	components: { ResponseWindow },
	store,
	el: '#response',
	template: '<ResponseWindow />',
});


Window.AssistantWindow = assistantWindow;

Window.AssistantWindow.$mount('#assistant');

Window.ResponseWindow = responseWindow;

Window.ResponseWindow.$mount('#response');
