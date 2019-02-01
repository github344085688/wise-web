'use strict';

define([
    './factories'
], function(factories, _) {
    factories.factory('taskService', function($resource, $q) {
        var resourceConfig = {
            'update': {
                method: 'PUT'
            },
            'search': {
                method: 'POST',
                isArray: true
            },
            'getReceipts': {
                method: 'GET',
                isArray: true
            }
        };

        var service = {};
        service.searchTasks = function(searchInfo) {
            return $resource("/wms-app/task/search",{}, resourceConfig).search(searchInfo).$promise;
        };

        service.createStep = function(taskId, step) {
            return $resource("/wms-app/task/:taskId/step", {taskId: taskId}).save(step).$promise;
        };

        service.removeStep = function(taskId, stepId) {
            return $resource("/wms-app/task/:taskId/step/:stepId", {taskId: taskId, stepId: stepId}, resourceConfig).update().$promise;
        };

        service.getSteps = function(taskId) {
            return $resource("/wms-app/task/:taskId/steps", {taskId: taskId}).get().$promise;
        };

        service.reorderSteps = function(taskId, stepIds) {
            return $resource("/wms-app/task/:taskId/step", {taskId: taskId}, resourceConfig).update(stepIds).$promise;
        };

        service.getTaskTypes = function (param) {
            return $resource('../../data/task-type.json').query().$promise;
        };

        service.searchTasksByPaging = function(searchInfo) {
            return $resource("/wms-app/task/search-by-paging",{}, {'search': {
                method: 'POST'
            }}).search(searchInfo).$promise;
        };

        service.assignTask = function(taskId, assigneeUserId) {
            return $resource("/wms-app/task/:taskId/assignment",
                {taskId: taskId}, resourceConfig).update(assigneeUserId).$promise;
          };
          
        return service;
    });
});

