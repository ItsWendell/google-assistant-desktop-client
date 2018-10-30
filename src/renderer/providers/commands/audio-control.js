import RobotJS from 'robotjs';

export default [
	{
		smart: false,
		indexes: [
			'play media',
			'continue playing music',
			'continue playing video',
			'play music',
			'pause music',
			'toggle music',
			'turn on the music',
			'stop music',
			'stop playing music',
			'stop the music',
			'stop * music',
		],
		action: () => {
			Window.Assistant.say('Alright will do!');
			RobotJS.keyTap('audio_play');
		},
	},
];
