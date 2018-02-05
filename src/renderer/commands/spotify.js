export default [
	{
		smart: false,
		indexes: [
			'spotify login',
			'login to spotify',
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
			'what is playing',
		],
		action: () => {
			Window.Spotify.getMyCurrentPlayingTrack().then((track) => {
				console.log('Current song?', track);
				if (track.item) {
					console.log('spotify song', track);
					Window.Assistant.say(`You're listening to ${track.item.name} by ${track.item.artists[0].name}`);
				} else {
					Window.Assistant.say('nothing is playing right now.');
				}
			}).catch((err) => {
				if (err.message && err.statusCode === 401) {
					Window.Assistant.say('You\'re not logged in to Spotify, say or type \'login to spotify\' to login.');
				} else {
					console.log(err);
					Window.Assistant.say('Something went wrong getting information from Spotify, try \'login to spotify\' to try again');
				}
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
				Window.Assistant.say('Something went wrong getting information from Spotify, try \'login to spotify\' to try again');
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
