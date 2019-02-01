'use strict';

define([
    './factories', 'lodash'
], function(factories, _) {
    factories.factory('cycleCountTaskService', function($q, $resource) {
        var services = {};
        services.createTask = function(task)
        {
             return $resource('/wms-app/cycle-count/task').save(task).$promise;
        };

        services.updateTask = function(taskId, task) {
             return $resource('/wms-app/cycle-count/task/:taskId', {taskId:taskId}, {'update': {
                 method: 'PUT'
             }}).update(task).$promise;
        };

        services.getTask = function(taskId) {
            return $resource('/bam/wms-app/cycle-count/task/:taskId', {taskId:taskId}).get().$promise;
        };

        services.queryTasks = function() {
            return $resource('/bam/wms-app/cycle-count/task').query().$promise;
        };

        services.searchTasks = function(searchParam) {
            return $resource('/wms-app/cycle-count/task/search',{},{'search': { method: 'POST',isArray: true }}).search(searchParam).$promise;
        };

        services.deleteTask = function(taskId){
            return $resource('/wms-app/cycle-count/task/' + taskId).delete().$promise;
        };

        services.finalizeTask = function(taskId){
            return $resource('/wms-app/cycle-count/task/:taskId/finalize', {taskId: taskId} ,
                {'finalize': { method: 'PUT' }}).finalize().$promise;
        };

        services.startTask = function(taskId){
            return $resource('/wms-app/cycle-count/task/:taskId/start',{taskId: taskId}).get().$promise;
        };

        services.completeTask = function(taskId){
            return $resource('/wms-app/cycle-count/task/:taskId/complete',null,
                {'complete': { method: 'PUT' }}).complete().$promise;
        };


        services.searchBasicCountByPaging = function(searchParam) {
            return $resource('/bam/wms-app/inventory-count/search-by-paging',{},
                {'search': { method: 'POST'}}).search(searchParam).$promise;
        };

        services.getAllBasicCountData = function(searchParam) {
            return $resource('/bam/wms-app/inventory-count/all-data',{},
                {'search': { method: 'POST',isArray: true}}).search(searchParam).$promise;
        };

        services.deleteBasicCount = function(countId){
            return $resource('/wms-app/inventory-count/' + countId).delete().$promise;
        };

        services.adjustCountData = function(param) {
            return $resource('/wms-app/inventory-count/adjust',{},
                {'adjust': { method: 'PUT'}}).adjust(param).$promise;
        };

        services.updateBasicCount = function(countId,param){
            return $resource('/wms-app/inventory-count/' + countId,{},
                {'update': { method: 'PUT'}}).update(param).$promise;
        };


        return services;
    });
});

