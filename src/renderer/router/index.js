import VueRouter from 'vue-router';

/**
 * Load a container lazy or async.
 *
 * @param  {string} name
 * @return {function}
 */
export function lazyLoadContainer(name) {
	return resolve => require([`@/containers/${name}`], resolve).default; // eslint-disable-line
}

export default new VueRouter({
	mode: 'history',
	base: __dirname,
	routes: [
		{
			path: '/',
			name: 'home',
			component: lazyLoadContainer('Home'),
		},
		{
			path: '/inspire',
			name: 'inspire',
			component: lazyLoadContainer('InspireView'),
		},
		{
			path: '/mini',
			name: 'mini',
			component: lazyLoadContainer('MiniView'),
		},
		{
			path: '*',
			redirect: '/',
		},
	],
});
