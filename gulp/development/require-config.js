'use strict';

require.config({
	waitSeconds: 30,
	baseUrl: linc.config.host
});

require(['index_0.js', 'index_1.js', 'index_2.js', 'index_3.js'], function() {
	require(['bootstrap']);
});