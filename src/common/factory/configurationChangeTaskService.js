/**
 * Created by Giroux on 2016/9/28.
 */
'use strict';

define([
    './factories'
], function(factories) {
    factories.factory('configurationChangeTaskService', function($resource) {
        var services = {};
        var resourceConfig = {
            'update': {
                method: 'PUT'
            },
            'search': {
                method: 'POST',
                isArray: true
            },
            'split': {
                method: 'PUT',
                isArray: true
            }
        };

        services.getTaskById = function(taskId) {
            return $resource("/bam/configuration-change/task/:taskId", {taskId:taskId}).get().$promise;
        };

        services.getTaskBasicInfoById = function(taskId) {
            return $resource("/wms-app/configuration-change/task/:taskId", {taskId:taskId}).get().$promise;
        };

        services.searchTask = function(searchParam) {
            return $resource('/bam/configuration-change/task/search', {}, resourceConfig).search(searchParam).$promise;
        };

        services.searchTasksByPaging = function(searchParam) {
            return $resource("/bam/configuration-change/task/search-by-paging", {},  {
                'search': {
                    method: 'POST'
                }
            }).search(searchParam).$promise;
        };

        services.deleteTask = function(taskId) {
            return $resource("/wms-app/configuration-change/task/:taskId", {taskId:taskId}).delete().$promise;
        };

        services.createTask = function(task) {
            return $resource("/wms-app/configuration-change/task").save(task).$promise;
        };

        services.updateTask = function(task) {
            return $resource("/wms-app/configuration-change/task/:taskId",{taskId:task.id},
                resourceConfig).update(task).$promise;
        };

        services.splitTask = function(taskId, splitTasks) {
            return $resource("/wms-app/configuration-change/task/:taskId/split",
                {taskId: taskId}, resourceConfig).split(splitTasks).$promise;
        };

        services.mergeTask = function(taskId, mergeTask) {
            return $resource("/wms-app/configuration-change/task/:taskId/merge",
                {taskId: taskId}, resourceConfig).update(mergeTask).$promise;
        };

        services.searchTaskForGroup = function(searchParam) {
            return $resource('/bam/configuration-change/task/search-for-group', {}, resourceConfig).search(searchParam).$promise;
        };

        return services;
    });


});