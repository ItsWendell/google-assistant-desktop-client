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
];
