'use strict';
define([
	'angular',
	'src/admin/service/ps/template-field-config/templateFieldConfigController'
], function(angular, controller) {
	angular.module('linc.admin.service.ps.templateFieldConfig', [])
		   .controller('TemplateFieldConfigController', controller);

});