export default [
	{
		smart: false,
		indexes: [
			'spotify login',
		],
		action: () => {
			Window.Spotify.authenticate();
		},
	},
	{
		smart: false,
		indexes: [
			'what song is playing on spotify',
		],
		action: () => {
			const song = Window.Spotify.getMyCurrentPlayingTrack();
			let response;
			response += 'The song ';
			response += song.item.name;
			response += ' is playing!';
			Window.Assistant.say(response);
		},
	},
];
