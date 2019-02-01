'use strict';

define([
    './factories'
], function (factories, _) {
    factories.factory('qcTaskService', function ($resource, lincUtil) {
        var resourceConfig = {
            'update': {
                method: 'PUT'
            },
            'search': {
                method: 'POST'
            }
        };
        var service = {};
        service.searchQcTask = function (param) {
            return $resource("/bam/outbound/qc-task/search", {}, resourceConfig).search(param).$promise;
        };

        service.searchQcTaskByPaging = function (param) {
            return $resource("/bam/outbound/qc-task/search-by-paging", {}, resourceConfig).search(param).$promise;
        };

        service.createQcTaskForAndroid = function (param) {
            return $resource("/wms-app/outbound/qc-task/customer/:customerId/long-haul/:longHaulId", param).get().$promise;
        };


        service.createQcTask = function (param) {
            return $resource("/wms-app/outbound/qc-task").save(param).$promise;
        };

        service.updateQcTask = function (qcTask) {
            return $resource("/wms-app/outbound/qc-task/:id", { id: qcTask.id }, resourceConfig).update(qcTask).$promise;
        };


        service.getQcTask = function (qcTaskId) {
            return $resource("/bam/outbound/qc-task/:id", { id: qcTaskId }).get().$promise;
        };

        service.getQcTaskProcessView = function (qcTaskId) {
            return $resource("/bam/outbound/qc-task/:taskId/process/view", { taskId: qcTaskId }).get().$promise;
        };

        service.deleteQcTask = function (qcTaskId) {
            return $resource("/wms-app/outbound/qc-task/:id", { id: qcTaskId }).delete().$promise;
        };


        return service;
    });
});
