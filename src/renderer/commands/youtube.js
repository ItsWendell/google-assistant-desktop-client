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
			let answer;
			answer = 'Playing ';
			answer += wildcard;
			answer += ' on YouTube';
			Window.Assistant.say(answer);
			opn('https://www.youtube.com/results?search_query='.concat(encodeURIComponent(wildcard)));
		},
	},
];
