'use strict';
define([
	'angular',
	'src/admin/service/ps/module-template/moduleTemplateController'
], function(angular, controller) {
	angular.module('linc.admin.service.ps.moduleTemplate', [])
		   .controller('ModuleTemplateController', controller);
});