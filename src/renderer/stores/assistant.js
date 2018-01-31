export default {
	state: {
		messages: [],
		commandResponse: '',
		speechTextBuffer: '',
		statusMessage: '',
		status: 'loading',
		isMini: false,
	},

	mutations: {
		addMessage(state, message) {
			state.messages.push(message);
		},
		removeMessage(state, message) {
			state.messages.splice(state.todos.indexOf(message), 1);
		},
		updateLatestMessage(state, message) {
			let buffer = state.messages.pop();
			buffer = Object.assign(buffer, message);
			state.messages.push(buffer);
		},
	},

	getters: {
		messages: state => state.messages,
	},
};
