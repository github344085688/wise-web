'use strict';

define([
	'angular',
	'src/app'
], function(angular, app) {
	angular.element().ready(function() {
		// bootstrap the app manually
		angular.bootstrap(document, ['linc']);
	});
});