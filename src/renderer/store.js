import Vue from 'vue';
import Vuex from 'vuex';

import assistantStore from '@/stores/assistant';

Vue.use(Vuex);

export default new Vuex.Store({
	modules: {
		assistant: assistantStore,
	},
});
