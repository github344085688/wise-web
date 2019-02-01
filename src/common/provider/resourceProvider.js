'use strict';

define([
	'./providers'
], function(providers) {
	return providers.provider('resourceProvider', function() {
		var resourceConfig = {};

		this.$get = function() {
			return {
				setResourceConfig: function(config) {
					resourceConfig = config;
				}
			};
		};
	});
});