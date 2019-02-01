'use strict';

define([
    './factories'
], function(factories, _) {
    factories.factory('loadTaskService', function($resource) {
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
        service.searchTask = function(param){
            return $resource("/bam/wms-app/outbound/load-task/search",{}, resourceConfig) .search(param).$promise;
        };

        service.searchTasksByPaging = function(searchInfo) {
            return $resource("/bam/wms-app/outbound/load-task/search-by-paging",{}, {'search': {
                method: 'POST'
            }}).search(searchInfo).$promise;
        };

        service.updateTask = function(loadTask){
            return $resource("/wms-app/outbound/load-task/" + loadTask.id,{}, resourceConfig).update(loadTask).$promise;
        };


        service.getTaskByTaskId = function(taskId) {
            return $resource("/bam/wms-app/outbound/load-task/:taskId").get({
                taskId: taskId
            }).$promise;
        };
        
        service.deleteTask = function(taskId) {
            return $resource("/wms-app/outbound/load-task/:taskId", {taskId:taskId}).delete().$promise;
        };

        service.getMaterialPhotos = function (taskId) {
            return $resource("/wms-app/outbound/load-task/:taskId/material-line").query({taskId: taskId}).$promise
        };

        service.reopenStep = function (taskId, stepId) {
            return $resource("/wms-app/outbound/task/:taskId/step/:stepId/reopen", {taskId: taskId, stepId: stepId}, resourceConfig).update().$promise;
        };

        service.cancelTask = function (taskId) {
            return $resource("/wms-app/outbound/task/:taskId/cancel", {taskId: taskId}, resourceConfig).update().$promise;
        };

        return service;
    });
});
