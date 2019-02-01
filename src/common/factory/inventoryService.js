'use strict';

define([
    './factories'
], function(factories, _) {
    factories.factory('inventoryService', function($resource) {
        var service = {};
        service.searchInventories = function(param) {
            return $resource("/bam/wms-app/inventories/search",{}, {'search': { 'method': 'POST'}}).search(param).$promise;
        };

        service.searchByPaging = function(param) {
            return $resource("/bam/wms-app/inventories/search-by-paging",{}, {'search': { 'method': 'POST'}}).search(param).$promise;
        };
        service.searchAvailablePickInventory = function(param) {
            return $resource("/bam/inventories/search-available-pick-inventory",{}, {'search': { 'method': 'POST'}}).search(param).$promise;
        };

        service.searchSummaryByPaging = function(param) {
            return $resource("/bam/wms-app/inventories/search-sum-by-paging",{}, {'search': { 'method': 'POST'}}).search(param).$promise;
        };

        service.getInventory = function(param) {
            return $resource("/bam/wms-app/inventories/search",{}, {'search': { 'method': 'POST'}}).search(param).$promise;
        };
        
        service.getInventoryForGis = function(param) {
        	return $resource("/bam/wms-app/inventory-gis/search",{}, {'search': { 'method': 'POST', isArray: true}}).search(param).$promise;
        };
        
        service.getInventoryLocations = function(param) {
            return $resource("/bam/wms-app/inventory-gis/locations",{}, {'search': { 'method': 'POST', isArray: true}}).search(param).$promise;
        };

        service.getItemCount = function(param) {
        	return $resource("/bam/wms-app/inventory-gis/item-count",{}, {'search': { 'method': 'POST'}}).search(param).$promise;
        };
        
        service.getLPCountByLocation = function() {
        	return $resource("/bam/wms-app/inventory-gis/lp-count",{}, {'search': { 'method': 'POST', isArray: true}}).search().$promise;
        };

        service.getTitlesByItem = function(itemSpecId) {
            return $resource("/bam/wms-app/inventory-title/item-spec/:itemSpecId",{itemSpecId: itemSpecId}).query().$promise;
        };

        service.searchInventoryLocks = function(param) {
            return $resource("/bam/wms-app/inventory-locks-for-create-pick-task",{}, {'search': { 'method': 'POST'}}).search(param).$promise;
        };

        service.searchInventoryLocksByPaging = function(param) {
            return $resource("/bam/wms-app/inventory-locks-search",{}, {'search': { 'method': 'POST'}}).search(param).$promise;
        };

        service.statistics = function (param) {
            return $resource("/bam/wms-app/inventory-location/statistics",{}, {'search': { 'method': 'POST'}}).search(param).$promise;
        };

        service.getInventoryLP = function(id) {
            return $resource('/wms-app/lp/' + id).get().$promise;
        };

        service.getLpLocation = function (lpId) {
            return $resource('/wms-app/lp/location/' + lpId).get().$promise;
        };

        service.getLPByLocation = function (param) {
            return $resource("/wms-app/lp/search",{}, {'search': { 'method': 'POST', isArray: true}}).search(param).$promise;
        };

        service.getLocationInventoryLPs = function (locationId) {
            return $resource("/wms-app/lp/inventory-lpId/"+ locationId, {}, {'search': { 'method': 'GET', isArray: true}}).search().$promise;
        };

        service.createSingleLP = function (param) {
            return $resource('/wms-app/lp/single/:locationId/:type', param).get().$promise;
        };

        service.getEmptyLP = function () {
            return $resource('/wms-app/lp/empty', {}, {'search': { 'method': 'GET', isArray: true}}).search().$promise;
        };

        service.searchSimpleInventory = function (param) {
            return $resource("/bam/wms-app/inventory-simple/search",{},
                {'search': { 'method': 'POST', isArray: true}}).search(param).$promise;
        };

        service.batchCreateLP = function (param) {
            return $resource('/wms-app/lp/batch',{}, {'post': { 'method': 'POST'}}).post(param).$promise;
        };

        service.getInventoryWithLpId = function(lpId) {
            return $resource('/wms-app/inventory/lp/' + lpId).query().$promise;
        };

        service.batchCreate = function(param) {
            return $resource('/wms-app/inventories',{}, {'post': { 'method': 'POST'}}).post(param).$promise;
        };

        service.fetchItemVelocity = function(param) {
            return $resource("/bam/wms-app/inventories/order-item-line/statistics/velocity", null, {"search": { method: 'POST'}}).search(param).$promise;
        };

        service.multiItemLocation = function(param) {
            return $resource("/report-center/location/multi-item-location/search-by-paging", null, {"search": { method: 'POST'}}).search(param).$promise;
        };

        service.searchEmptyLocation = function(param) {
            return $resource("/report-center/inventory/empty-location-report/searchByPaging", null, {"search": { method: 'POST'}}).search(param).$promise;
        };

        service.itemErrorDistributed = function(param) {
            return $resource("/report-center/inventory/item-error-distributed/searchByPaging", null, {"search": { method: 'POST'}}).search(param).$promise;
        };

        service.searchTurns = function(param) {
            return $resource("/report-center/inventory/turns/search", null, {"search": { method: 'POST'}}).search(param).$promise;
        };

        service.manualRelease = function(id,releasedQty) {
            return $resource("/wms-app/outbound/inventory-lock/:id/manual-release/:releasedQty", {id:id,releasedQty:releasedQty}, {"search": { method: 'Put'}}).search().$promise;
        };

        service.legacyInventoryMakePalletReport = function(param) {
            return $resource("/report-center/legacy-inventory/make-pallet-adjustment-report", null, {"search": { method: 'POST'}}).search(param).$promise;
        };

        return service;
    });
});
