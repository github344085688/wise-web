'use strict';

define(['lodash',
    './factories',], function (_, factories) {

    factories.factory('monitorService', function ($resource) {
        var service = {};

        service.getScheduledDocuments = function () {
            return $resource('/bam/dashboard/monitor/scheduled-doc').get().$promise;
        };

        service.getUnAssignedDocuments = function () {
            return $resource('/bam/dashboard/monitor/unassigned-scheduled-doc').get().$promise;
        };

        service.getAssignedDocuments = function () {
            return $resource('/bam/dashboard/monitor/assigned-scheduled-doc').get().$promise;
        };

        service.getInProgressReceipts = function() {
            return $resource('/bam/dashboard/monitor/inprogress-receipts').query().$promise;
        };


        service.getInProgressOrders = function() {
            return $resource('/bam/dashboard/monitor/inprogress-orders').query().$promise;
        };

        service.getInternalStatusOrders = function() {
            return $resource('/bam/dashboard/monitor/inprogress-internal').query().$promise;
        };


        service.searchInProgressLoading = function(params) {
            return $resource('/report-center/dashboard/in-progress-loading/search-by-paging', null, {"search": { method: 'POST'}}).search(params).$promise;
        };

        service.searchEquipmentInYard = function(params) {
            return $resource('/report-center/dashboard/equipment-in-yard/search-by-paging', null, {"search": { method: 'POST'}}).search(params).$promise;
        };

        
        service.batchCheckoutEquipmentInYard = function(params) {
            return $resource('/bam/yard-equipment/batch-checkout', null, {"update": { method: 'PUT'}}).update(params).$promise;
        };

        service.searchEmptyContainerInYard = function(params) {
            return $resource('/report-center/dashboard/empty-container-in-yard/search-by-paging', null, {"search": { method: 'POST'}}).search(params).$promise;
        };

        service.searchDriverWaitingPool = function(params) {
            return $resource('/report-center/dashboard/driver-waiting-pool/search-by-paging', null, {"search": { method: 'POST'}}).search(params).$promise;
        };

        service.searchDockStatus = function(params) {
            return $resource('/report-center/dashboard/dock-door-status/search-by-paging', null, {"search": { method: 'POST'}}).search(params).$promise;
        };

        service.searchLaborAssignment = function(params) {
            return $resource('/report-center/dashboard/labor-assignment/search-by-paging', null, {"search": { method: 'POST'}}).search(params).$promise;
        };

        service.searchInProgressOffloading = function(params) {
            return $resource('/report-center/dashboard/in-progress-offloading/search-by-paging', null, {"search": { method: 'POST'}}).search(params).$promise;
        };

        service.searchTaskUnassigned = function(params) {
            return $resource('/report-center/dashboard/task/unassigned/search-by-paging', null, {"search": { method: 'POST'}}).search(params).$promise;
        };

        service.searchTaskInProgress = function(params) {
            return $resource('/report-center/dashboard/task/in-progress/search-by-paging', null, {"search": { method: 'POST'}}).search(params).$promise;
        };

        service.searchDashboardTemplate = function(params) {
            return $resource('/fd-app/user-dash-board-configuration/search', null, {"search": { method: 'POST',isArray:true}}).search(params).$promise;
        };

        service.createNewDashboardTemplate = function(dashboardConfig) {
            return $resource("/fd-app/user-dash-board-configuration").save(dashboardConfig).$promise;
        };

        service.getNewDashboardTemplate = function(id) {
            return $resource("/fd-app/user-dash-board-configuration/:id",{id:id}).get().$promise;
        }; 

        service.updateNewDashboardTemplate = function(id,dashboardConfig) {
            return $resource("/fd-app/user-dash-board-configuration/:id", {id: id}, {'update': { method: 'PUT'}}).update(dashboardConfig).$promise;
        };

        return service;
    });
});
