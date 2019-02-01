'use strict';

define([
    './factories',
    'lodash'
], function(factories, _) {
    factories.factory('parcelPackTaskService', function($q, $resource) {
        var services = {};
        var resourceConfig = {
            'update': {
                method: 'PUT'
            },
            'search': {
                method: 'POST',
                isArray: true
            },
            'post': {
                method: 'POST'
            }
        };

        services.searchTasksByPaging = function(param) {
            return $resource('/bam/wms-app/outbound/parcel-pack/task/search-by-paging', {}, {'search': {
                method: 'POST'
            }}).search(param).$promise;
        };

        services.getTask = function(taskId){
            return $resource("/bam/wms-app/outbound/parcel-pack/task/:taskId", {taskId: taskId}).get().$promise;
        };

        services.reopenTask = function(taskId){
            return $resource('/wms-app/outbound/parcel-pack/task/:taskId/reopen',
                {taskId: taskId}, resourceConfig).update().$promise;
        };

        services.reopenStep = function (taskId, stepId) {
            return $resource("/wms-app/outbound/parcel-pack/step/:stepId/reopen", {taskId: taskId, stepId: stepId},
                resourceConfig).update().$promise;
        };

        services.deleteTask = function(taskId){
            return $resource("/wms-app/outbound/parcel-pack/task/:taskId", {taskId:taskId}).delete().$promise;
        };

        return services;
    });
});
