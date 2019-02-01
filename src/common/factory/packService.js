'use strict';

define([
    './factories',
    'lodash'
], function(factories, _) {
    factories.factory('packService', function($q, $resource) {
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
        services.searchPackOrder = function(param) {
            return $resource('/bam/outbound/pack/order/search', null, {
                'postSearch': {
                    method: 'POST',
                    isArray: true
                }
            }).postSearch(param).$promise;
        };

        services.searchTasksByPaging = function(param) {
            return $resource('/bam/outbound/pack/pack-task/search-by-paging', {}, {'search': {
                method: 'POST'
            }}).search(param).$promise;
        };

        services.getPackTaskList = function(param) {
            return $resource('/bam/outbound/pack/pack-task/search', null, {
                'postSearch': {
                    method: 'POST'
                }
            }).postSearch(param).$promise;
        };

        services.getPackOrderDetail = function(orderId) {
            return $resource('/bam/outbound/pack/order/:orderId').get({
                orderId: orderId
            }).$promise;
        };

        services.getPackOrderByOrderId = function(id) {
            return $resource('/bam/outbound/pack/order/:orderId').get({orderId: id}).$promise;
        };

        services.getPackOrderByLp = function(id) {
            return $resource('/bam/outbound/pack/lp-orders/:lpId').query({lpId: id}).$promise;
        };

        services.createPackTask = function(packTask) {
            return $resource("/wms-app/outbound/pack/task").save(packTask).$promise;
        };

        services.packOrder = function(taskId, orderId, packages){
            return $resource("/wms-app/outbound/pack/task/:taskId/package").save({taskId: taskId}, {orderId:orderId, packages: packages}).$promise;
        };

        services.deleteTask = function(taskId){
            return $resource("/wms-app/outbound/pack/task/:taskId", {taskId:taskId}).delete().$promise;
        };

        services.getTask = function(taskId){
            return $resource("/bam/outbound/pack/pack-task/:taskId", {taskId:taskId}).get().$promise;
        };

        services.updateTask = function(task) {
            return $resource("/wms-app/outbound/pack/task/:taskId",{taskId: task.id}, resourceConfig).update(task).$promise;
        };

        services.reopenTask = function(taskId){
            return $resource('/wms-app/outbound/pack/task/:taskId/reopen',
                {taskId: taskId}, resourceConfig).update().$promise;
        };

        services.reopenStep = function (taskId, stepId) {
            return $resource("/wms-app/outbound/pack/step/:stepId/reopen", {taskId: taskId, stepId: stepId}, resourceConfig).update().$promise;
        };

        return services;
    });


});
