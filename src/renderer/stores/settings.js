export default {
	state: {
		messages: [],
		commandResponse: '',
		speechTextBuffer: '',
		statusMessage: '',
		status: 'unauthenticated',
	},

	mutations: {
		addMessage(state, message) {
			state.messages.push(message);
		},
		removeMessage(state, message) {
			state.messages.splice(state.todos.indexOf(message), 1);
		},
	},

	getters: {
		messages: state => state.messages,
	},
};
