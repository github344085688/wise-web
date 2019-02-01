'use strict';

define([
	'angular',
	'../main/main',
	'./setupPageController'
], function(angular, main, controller) {
	var app = angular.module('linc.gis.setup', []);
	//.controller('SetupPageController', controller);

	app.directive('ngRightClick', function($parse) {
		return function (scope, element, attrs) {
			var fn = $parse(attrs.ngRightClick);
			element.bind('contextmenu', function (event) {
				scope.$apply(function () {
					event.preventDefault();
					fn(scope, {$event: event});
				});
			});
		};
	});

	main.register.controller('SetupPageController', controller);
});