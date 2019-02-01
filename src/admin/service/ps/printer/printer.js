'use strict';
define([
	'angular',
	'src/admin/service/ps/printer/printerPageController'
], function(angular, controller) {
	angular.module('linc.admin.service.ps.printer', [])
		   .controller('PrinterPageController', controller);

});