'use strict';

define([
    'angular',
    'src/admin/service/ps/template/templatePageController'
], function(angular, controller) {
    angular.module('linc.admin.service.ps.template', [])
        .controller('TemplatePageController', controller);
});
