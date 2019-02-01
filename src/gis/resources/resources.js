'use strict';

define([
	'angular',
	'../main/main',
	'./resourcesPageController'
], function(angular, main, controller) {
	angular.module('linc.gis.resources', [])
	.config(function($sceDelegateProvider) {
		$sceDelegateProvider.resourceUrlWhitelist(['self', 'rtsp://**']);
	})
	//.controller('ResourcesPageController', controller);
	
	main.register.controller('ResourcesPageController', controller);
});