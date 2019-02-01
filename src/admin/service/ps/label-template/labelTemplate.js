'use strict';
define([
    'angular',
    'src/admin/service/ps/label-template/labelTemplateController'
], function (angular, controller) {
    angular.module('linc.admin.service.ps.labelTemplate', [])
        .controller('LabelTemplateController', controller);
});