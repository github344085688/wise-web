'use strict';

define([
    './factories'
], function(factories, _) {
    factories.factory('receiveTaskService', function($resource, $q) {
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


        service.searchTasksBasicInfo = function(searchInfo) {
            return $resource("/wms-app/inbound/task/search",{}, resourceConfig).search(searchInfo).$promise;
        };


        service.search = function(searchInfo) {
            return $resource("/bam/inbound/task/web-search",{}, resourceConfig).search(searchInfo).$promise;
        };

        service.searchByPaging = function(searchInfo) {
            return $resource("/bam/inbound/task/search-by-paging",{}, {
                'search': {
                    method: 'POST'
                }
            }).search(searchInfo).$promise;
        };

        service.updateTask = function(task) {
            return $resource('/wms-app/inbound/task/:taskId', {taskId: task.id}, resourceConfig).update(task).$promise;
        };

        service.getTaskWithReceipts = function(id) {
            var promises = [];
            promises.push($resource("/wms-app/inbound/task/:taskId").get({taskId: id}).$promise);
            promises.push($resource("/bam/inbound/task/:taskId/receipts", {taskId: id}, resourceConfig).getReceipts().$promise);
            return $q.all(promises);
        };

        service.get = function(id) {
            return $resource("/bam/inbound/task/:taskId").get({taskId:id}).$promise;
        };

        service.getOffloadDetail =  function(id){
            return $resource("/bam/inbound/step/offload/:stepId").get({stepId:id}).$promise;
        };

        service.getLpSetupDetail = function(id){
            return $resource("/bam/inbound/step/lp-setup/:stepId/lp-view").get({stepId:id}).$promise;
        };

        service.getLpVerifyDetail = function(id){
            return $resource("/bam/inbound/step/lp-verify/:stepId/lp-view").get({stepId:id}).$promise;
        };

        service.getSnscanDetail = function(id){
            return $resource("/bam/inbound/step/sn-scan/:stepId/lp-view").get({stepId:id}).$promise;
        };

        service.updateOffload= function(offload) {
            return $resource("/wms-app/inbound/step/offload/:stepId",{stepId:offload.id}, resourceConfig).update(offload).$promise;
        };

        service.reopenStep = function (taskId, stepId) {
            return $resource("/wms-app/inbound/task/:taskId/step/:stepId/reopen", {taskId: taskId, stepId: stepId}, resourceConfig).update().$promise;
        };

        service.getReceiptTaskPhotos=function(receiptTaskIds){
            return $resource("/bam/inbound/task/photos",{}, resourceConfig).search({receiptTaskIds:receiptTaskIds}).$promise; 
        };

        service.forceClose = function (taskId) {
            return $resource("/wms-app/inbound/task/:taskId/force-close", {taskId: taskId}, resourceConfig).update().$promise;
        };

        service.cancelTask = function (taskId) {
            return $resource("/wms-app/inbound/task/:taskId/cancel", {taskId: taskId}, resourceConfig).update().$promise;
        };
        
        return service;
    });
});
