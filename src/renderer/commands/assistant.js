export default [
	{
		smart: false,
		indexes: [
			'custom commands',
		],
		action: () => {
			Window.Assistant.say('Seems like custom commands work!');
		},
	},
	{
		smart: false,
		indexes: [
			'talk',
			'let\'s talk',
			'I\'m bored',
		],
		action: () => {
			Window.Assistant.ask('What do you wanna talk about?').then((answer) => {
				Window.Assistant.say(`Alright, let's talk about ${answer}`);
			});
		},

	},
	{
		smart: false,
		indexes: [
			'Who created you',
			'Who is your creator',
			'Who programmed you',
			'testing',
		],
		action: () => {
			Window.Assistant.say('I was made by a team at Google.');
			Window.Assistant.say('But this Desktop client you are using is made by the open source community.', 1);
			Window.Assistant.say('Pretty awesome right?', 1);
		},
	},
	{
		smart: false,
		indexes: [
			'clear screen',
			'clear window',
			'clear conversation',
		],
		action: () => {
			Window.Store.state.assistant.messages = [];
		},
	},
	{
		smart: false,
		indexes: [
			'make smaller',
			'mini mode',
		],
		action: () => {
			Window.Assistant.setMiniMode(true);
		},
	},
	{
		smart: false,
		indexes: [
			'make bigger',
			'disable mini mode',
			'make screen bigger',
		],
		action: () => {
			Window.Assistant.setMiniMode(false);
		},
	},
	{
		smart: false,
		indexes: [
			'exit',
			'turn off',
		],
		action: () => {
			// [TODO]: Exiting app
		},
	},
	{
		smart: false,
		indexes: [
			'ping',
		],
		action: () => {
			Window.Assistant.playPing();
		},
	},
];
