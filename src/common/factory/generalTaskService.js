'use strict';

define([
    './factories'
], function(factories, _) {
    factories.factory('generalTaskService', function($resource) {
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

        function setupTaskType(param) {
            param.taskType = "Generic";
        }

        service.searchTask = function(param) {
            setupTaskType(param);
            return $resource("/bam/wms-app/general-task/search",{}, resourceConfig).search(param).$promise;
        };

        service.searchTasksByPaging = function(searchInfo) {
            return $resource("/bam/wms-app/general-task/search-by-paging",{}, {'search': {
                method: 'POST'
            }}).search(searchInfo).$promise;
        };

        service.createTask = function(param) {
            setupTaskType(param);
            return $resource("/wms-app/general-task").save(param).$promise;
        };

        service.updateTask = function(task) {
            setupTaskType(task);
            return $resource("/wms-app/general-task/:taskId",{taskId:task.id}, resourceConfig).update(task).$promise;
        };

        service.getTask = function(taskId) {
            return $resource("/wms-app/general-task/:taskId", {taskId:taskId}).get().$promise;
        };

        service.deleteTask = function(taskId) {
            return $resource("/wms-app/general-task/:taskId", {taskId:taskId}).delete().$promise;
        };

        service.batchAssignTask = function(param) {
            return $resource("/wms-app/general-task/batch-assignment" ,{}, resourceConfig).update(param).$promise;
        };

        service.getTaskReport = function(param){
            return $resource('/bam/general-task/task-report').get().$promise;
        };

        return service;
    });
});
