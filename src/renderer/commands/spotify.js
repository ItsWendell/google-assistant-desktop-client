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
			'spotify song',
			'what is playing right now',
			'what\'s playing right now',
			'what music is playing',
			'what song is this',
			'what\'s playing',
			'what song is playing',
			'what artist is playing',
			'what artist is playing right now',
			'who is playing right now',
			'who\'s playing right now',
		],
		action: () => {
			Window.Spotify.getMyCurrentPlayingTrack().then((track) => {
				console.log('spotify song', track);
				Window.Assistant.say(''.concat(track.item.name, ' by ', track.item.artists[0].name));
			}).catch((err) => {
				console.log(err);
				Window.Assistant.say('Something went wrong getting information from Spotify, try \'spotify login\' to try again');
			});
		},
	},
	{
		smart: false,
		indexes: [
			'spotify next',
			'play the next song',
			'next',
			'play next',
		],
		action: () => {
			Window.Spotify.skipToNext().then(() => {
				Window.Assistant.say('Alright!', 0, true);
			}).catch((err) => {
				console.log(err);
				Window.Assistant.say('Something went wrong getting information from Spotify, try \'spotify login\' to try again');
			});
		},
	},
	{
		smart: false,
		indexes: [
			'shuffle music',
		],
		action: () => {
			Window.Spotify.shuffle().then(() => {
				Window.Assistant.say('Enjoy!');
			}).catch((err) => {
				console.log(err);
				Window.Assistant.say('Something went wrong getting information from Spotify, try \'spotify login\' to try again');
			});
		},
	},
];
