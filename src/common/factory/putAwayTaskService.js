'use strict';

define([
    './factories'
], function(factories, _) {
    factories.factory('putAwayTaskService', function($resource) {
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

        service.searchTasksByPaging = function(param) {
            return $resource('/bam/wms-app/warehouse/put-away/task/search-by-paging', {}, { 'search': {
                method: 'POST'
            }}).search(param).$promise;
        };

        service.searchTask = function(param) {
            return $resource("/bam/wms-app/warehouse/put-away/task/search",{}, resourceConfig).search(param).$promise;
        };
        
        service.getTask = function(taskId) {
            return $resource("/bam/wms-app/warehouse/put-away/task/:taskId", {taskId:taskId}).get().$promise;
        };

        service.updateTask = function(taskId) {
            return $resource("/wms-app/warehouse/put-away/task/:taskId", {taskId:taskId}, resourceConfig).update(task).$promise;
        };

        service.deleteTask = function(taskId){
            return $resource('/wms-app/warehouse/put-away/task/' + taskId).delete().$promise;
        };
        
        return service;
    });
});
