/* eslint-disable */
import 'babel-polyfill';

// eslint-disable-next-line
import { ipcRenderer } from 'electron';

import Vue from 'vue';
import axios from 'axios';
import Vuetify from 'vuetify';

import 'vuetify/dist/vuetify.css';

import App from './App';

import VueRouter from 'vue-router';
import router from './router';

import Vuex from 'vuex';
import store from './store';

import SpotifyClient from './spotify';


Vue.use(Vuetify);
Vue.use(Vuex);
Vue.use(VueRouter);

if (!process.env.IS_WEB) Vue.use(require('vue-electron'));
Vue.http = Vue.prototype.$http = axios;
Vue.config.productionTip = false;

Window.Store = store;

Window.Spotify = new SpotifyClient();

/* eslint-disable no-new */
const app = new Vue({
	components: { App },
	store,
	router,
	el: '#app',
	template: '<App/>',
});

Window.App = app;

Window.App.$mount('#app');
