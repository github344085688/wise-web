'use strict';

define([
	'angular',
	'src/login/loginPageController'
], function(angular, controller) {
	angular.module('linc.login', [])
	.controller('LoginPageController', controller);

});