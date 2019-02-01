
'use strict';

define([
    './factories',
    'lodash'
], function(factories, _) {
    factories.factory('pickService', function($q, $resource) {
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
            },
            'split': {
                method: 'PUT',
                isArray: true
            }

        };
        var services = {};

        services.createPickTask = function(task)
        {
            return $resource('/wms-app/outbound/pick/task/').save(task).$promise;
        };

        services.updatePickTask = function(task) {
            return $resource('/wms-app/outbound/pick/task/:taskId', {taskId:task.id}, resourceConfig).update(task).$promise;
        };

        services.getWaveSubTasks = function(taskId){
            return $resource('/data/wave-pick-sub-tasks.json').query().$promise;
        };

        services.getPickTaskList = function(param){
            return $resource('/bam/outbound/pick/pick-task/search', null, { 'search': {
                method: 'POST'
            }}).search(param).$promise;
        };

        services.searchTasksByPaging = function(param){
            return $resource('/bam/outbound/pick/pick-task/search-by-paging', null, { 'search': {
                method: 'POST'
            }}).search(param).$promise;
        };

        services.getPickTask = function(taskId){
            return $resource('/bam/outbound/pick/pick-task/' + taskId).get().$promise;
        };

        services.searchOrderItemLineFromPickTask = function(param){
            return $resource('/bam/outbound/pick/pick-task/order-item-line/search', null, { 'search': {
                method: 'POST',
                isArray: false
            }}).search(param).$promise;
        };
        
        services.searchBatchPickTaskOrderItemLine=function(param){
            return $resource('/bam/outbound/pick/bath-pick-task/order-item-line/search',null,{'search' :{ method:'POST', isArray:false }}).search(param).$promise;
        }
       
        services.voidTrackingNo = function(param){
            return $resource('/bam/wms-app/outbound/small-parcel-shipment/batch-void-trackingNo',null, { 'update': { method: 'PUT' } }).update(param).$promise;
        };


        services.getPickTaskView = function(taskId){
            return $resource('/bam/outbound/pick/pick-task/' + taskId + "/view").get().$promise;
        };

        services.deletePickTask = function(taskId){
            return $resource('/wms-app/outbound/pick/task/' + taskId).delete().$promise;
        };

        services.cancelPickTask = function(taskId){
            return $resource('/wms-app/outbound/pick/task/:taskId/cancel',
                {taskId: taskId}, resourceConfig).post().$promise;
        };

        services.reopenPickTask = function(taskId){
            return $resource('/wms-app/outbound/pick/task/:taskId/reopen',
                {taskId: taskId}, resourceConfig).update().$promise;
        };

        services.getCustomerFilters = function(param) {
            return $resource('/bam/outbound/pick/order-planning/customer-filter'
            ).query().$promise;
        };

        services.getLocationFilters = function(param) {
            return $resource('/bam/outbound/pick/order-planning/location-filter'
            ).query().$promise;
        };

        services.getItemFilters = function(param) {
            return $resource('/bam/outbound/pick/order-planning/item-summary-filter'
            ).query().$promise;
        };

        services.createBatchByOrderPickTask = function (tasks) {
            return $resource('/wms-app/outbound/pick/task/order-pick/batch', null, { 'Post': {
                method: 'POST'
            }}).Post(tasks).$promise;
        };

       //for order planning
        services.searchOrdersForPlanning = function(param) {
            return $resource('/bam/outbound/pick/order-planning/order-planning-search', null, { 'search': {
                method: 'POST',
                isArray: true
            }}).search(param).$promise;
        };

        services.searchOrdersForPickTask = function(param) {
            return $resource('/bam/outbound/pick/order-planning/order-search', null, { 'search': {
                method: 'POST',
                isArray: true
            }}).search(param).$promise;
        };

        services.splitTask = function(taskId, splitTasks) {
            return $resource("/wms-app/outbound/pick/task/:taskId/split", {taskId: taskId}, resourceConfig).split(splitTasks).$promise;
        };

        services.mergeTask = function(taskId, mergeTask) {
            return $resource("/wms-app/outbound/pick/task/:taskId/merge", {taskId: taskId}, resourceConfig).update(mergeTask).$promise;
        };

        services.getOrderPickItemLinesMap = function(taskId) {
            return $resource("/bam/outbound/pick/pick-task/:taskId/orderPickItemLinesMap",
                {taskId: taskId}).get().$promise;
        };

        services.reopenStep = function (taskId, stepId) {
            return $resource("/wms-app/outbound/pick/task/:taskId/step/:stepId/reopen", {taskId: taskId, stepId: stepId}, resourceConfig).update().$promise;
        };

        services.getPickStrategyReport = function(param){
            return $resource('/bam/pick/task/strategy-report', null, { "query": { method: 'GET', isArray: true }}).query().$promise;
        };

        services.getPickTaskReport = function(param){
            return $resource('/bam/pick/task/pick-task-report').get().$promise;
        };



        return services;
    });


});
