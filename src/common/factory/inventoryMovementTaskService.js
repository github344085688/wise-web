'use strict';

define([
    './factories'
], function(factories, _) {
    factories.factory('inventoryMovementTaskService', function($resource) {
        var resourceConfig = {
            'update': {
                method: 'PUT'
            },
            'search': {
                method: 'POST',
                isArray: true
            }
        };
        var service = {};

        service.searchTask = function(param) {
            return $resource("/bam/inventory-movement/task/search",{}, resourceConfig).search(param).$promise;
        };

        service.searchTasksByPaging = function(searchInfo) {
            return $resource("/bam/inventory-movement/task/search-by-paging",{}, {'search': {
                method: 'POST'
            }}).search(searchInfo).$promise;
        };

        service.getTask = function(taskId) {
            return $resource("/bam/inventory-movement/task/:taskId", {taskId: taskId}).get().$promise;
        };

        service.deleteTask = function(taskId) {
            return $resource("/wms-app/inventory/inventory-movement-task/:id", {id: taskId}).delete().$promise;
        };
        service.searchStepProcess = function (param) {
            return $resource("/bam/inventory-movement-task/step/process/search",{}, resourceConfig).search(param).$promise;
        };
        return service;
    });
});
