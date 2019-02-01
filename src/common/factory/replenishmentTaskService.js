'use strict';

define([
    './factories'
], function(factories, _) {
    factories.factory('replenishmentTaskService', function($q, $resource) {

        var resourceConfig = {
            'update': {
                method: 'PUT'
            },
            'search': {
                method: 'POST',
                isArray: true
            }
        };
        var services = {};

        services.searchTasksByPaging = function(param) {
            return $resource('/bam/inventory/replenishment-task/search-by-paging', null, {
                'postSearch': {
                    method: 'POST'
                }
            }).postSearch(param).$promise;
        };

        services.getTaskList = function(param) {
            return $resource('/bam/inventory/replenishment-task/search', null, {
                'postSearch': {
                    method: 'POST',
                    isArray: true
                }
            }).postSearch(param).$promise;
        };

        services.getTaskById = function(taskId){
            return $resource("/bam/inventory/replenishment-task/:taskId", {taskId:taskId}).get().$promise;
        };

        services.getTaskBasicInfoById = function(taskId){
            return $resource("/wms-app/inventory/replenishment-task/:taskId", {taskId:taskId}).get().$promise;
        };

        services.updateTask = function(task){
            return $resource("/wms-app/inventory/replenishment-task/:taskId",
                {taskId: task.id}, resourceConfig).update(task).$promise;
        };
        
        services.mergeReplenish = function (customerId) {
            return $resource("/wms-app/inventory/replenishment-task/customer/:customerId/merge", {customerId: customerId}, resourceConfig).update().$promise;
        };

        services.searchStepProcess = function (param) {
            return $resource("/bam/replenishment-task/step/search", null, {'postSearch': {
                method: 'POST',
                isArray: true
            }}).postSearch(param).$promise;
        };

        services.combineEAReplenishTasks = function (customerId) {
            return $resource("/wms-app/inventory/replenishment-task/customer/:customerId/combine", {customerId: customerId}, {
                'update': {
                    method: 'PUT',
                    isArray: true
                }}).update().$promise;
        };

        return services;
    });


});
