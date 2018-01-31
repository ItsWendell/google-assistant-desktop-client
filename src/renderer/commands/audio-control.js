import RobotJS from 'robotjs';
import SpotifyWebHelper from 'spotify-web-helper';

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
	{
		smart: false,
		indexes: [
			'what is playing right now',
			'what song is playing',
			'what artist is this',
			'what music is this?',
		],
		action: () => {
			const helper = SpotifyWebHelper();
			const { status } = helper;
			console.log(helper.status);
			const { track: TrackInfo } = status;
			let say;
			if (status.playing) {
				const { track_resource: Track } = TrackInfo;
				const { artist_resource: Artist } = TrackInfo;
				say += Track.name;
				say += ' by ';
				say += Artist.name;
				say += 'is playing right now on Spotify!';
				Window.Assistant.say(say);
			}
		},
	},
];
