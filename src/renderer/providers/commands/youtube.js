import opn from 'opn';

export default [
	{
		smart: true,
		indexes: [
			'play * on youtube',
			'open * on youtube',
			'search * on youtube',
			'find * on youtube'],
		action: (i, wildcard) => {
			Window.Assistant.say(`Playing ${wildcard} on YouTube`);
			opn('https://www.youtube.com/results?search_query='.concat(encodeURIComponent(wildcard)));
		},
	},
];
