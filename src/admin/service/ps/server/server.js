'use strict';
define([
	'angular',
	'src/admin/service/ps/server/serverPageController'
], function(angular, controller) {
	angular.module('linc.admin.service.ps.server', [])
		   .controller('ServerPageController', controller);

});