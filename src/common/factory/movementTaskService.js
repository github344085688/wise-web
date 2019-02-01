'use strict';

define([
    './factories'
], function(factories, _) {
    factories.factory('movementTaskService', function($resource, $q) {
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
        service.searchTask = function(searchInfo) {
            return $resource("/bam/movement/task/search",{}, resourceConfig).search(searchInfo).$promise;
        };

        service.searchTasksByPaging = function(searchInfo) {
            return $resource("/bam/movement/task/search-by-paging",{}, { 'search': {
                method: 'POST'
            }}).search(searchInfo).$promise;
        };

        service.getTaskById = function(taskId) {
            return $resource("/bam/movement/task/:taskId").get({taskId: taskId}).$promise;
        };
        return service;
    });
});
