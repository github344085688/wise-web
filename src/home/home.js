'use strict';
define([
	'angular',
	'src/home/homePageController'
], function(angular, controller) {
	angular.module('linc.home', ['linc.wms.main'])
	.controller('HomePageController', controller);
});

