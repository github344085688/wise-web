/**
 * Created by Giroux on 2016/9/28.
 */
'use strict';

define([
    './factories'
], function(factories) {
    factories.factory('putBackTaskService', function($resource) {
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
            return $resource("/wms-app/outbound/put-back/task/:taskId", {taskId:taskId}).get().$promise;
        };

        services.getTaskDetailById = function(taskId) {
            return $resource("/bam/outbound/put-back/task/:taskId", {taskId:taskId}).get().$promise;
        };

        services.searchTasksByPaging = function(searchParam) {
            return $resource('/bam/outbound/put-back/task/search-by-paging', {}, {'search': {
                method: 'POST'
            }}).search(searchParam).$promise;
        };

        services.searchTask = function(searchParam) {
            return $resource('/bam/outbound/put-back/task/search', {}, resourceConfig).search(searchParam).$promise;
        };

        services.updateTask = function(task) {
            return $resource("/wms-app/outbound/put-back/task/:taskId",{taskId:task.id},
                resourceConfig).update(task).$promise;
        };

        services.searchHistory = function (param) {
            return $resource("/bam/outbound/put-back/task/history-search", null, {'postSearch': {
                method: 'POST',
                isArray: true
            }}).postSearch(param).$promise;
        };

        return services;
    });


});