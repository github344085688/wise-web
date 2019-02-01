'use strict';

define([
    'angular',
    './unassignedTaskController'
], function(angular, UnassignedTaskController) {
    angular.module('linc.wms.task.unassigned-task', [])
        .config(['$stateProvider', function($stateProvider) {
            $stateProvider.state('wms.task.unassignedTask.list', {
                    url: '/list',
                    templateUrl: 'wms/task/unassigned-task/template/unassignedTask.html',
                    controller: 'UnassignedTaskController'
                });
        }])
        .controller('UnassignedTaskController', UnassignedTaskController)
});