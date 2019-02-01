'use strict';

define([
    './factories'
], function (factories, _) {
    factories.factory('inventoryCountService', function ($resource) {

        var service = {};

        service.importInventoryCount = function (param) {
            return $resource("/wms-app/inventory-count/import", null, { 'update': { 'method': 'PUT', isArray: true } }).update(param).$promise;
        };

        service.searchCompareData = function (param) {
            return $resource("/bam/wms-app/inventory-count/compare-data", null, { 'search': { 'method': 'POST' } }).search(param).$promise;
        };

        service.compareResultData = function (param) {
            return $resource("/wms-app/inventory-count/result", null, { 'search': { 'method': 'POST' } }).search(param).$promise;
        };


        service.acknowledgeBySKU = function (param) {
            return $resource("/wms-app/inventory-count/acknowledge-by-sku", null, { 'update': { 'method': 'PUT' } }).update(param).$promise;
        };

        service.unAcknowledgeBySKU = function (param) {
            return $resource("/wms-app/inventory-count/disacknowledge-by-sku", null, { 'update': { 'method': 'PUT' } }).update(param).$promise;
        };

        service.acknowledgeByLocation = function (param) {
            return $resource("/wms-app/inventory-count/acknowledge-by-location", null, { 'update': { 'method': 'PUT' } }).update(param).$promise;
        };

        service.unAcknowledgeByLocation = function (param) {
            return $resource("/wms-app/inventory-count/disacknowledge-by-location", null, { 'update': { 'method': 'PUT' } }).update(param).$promise;
        };

        service.confirmBySKU = function (param) {
            return $resource("/wms-app/inventory-count/confirm-by-sku", null, { 'update': { 'method': 'PUT' } }).update(param).$promise;
        };

        service.submitInventCount = function (param) {
            return $resource("/wms-app/inventory-count/submit", null, { 'submit': { 'method': 'PUT' } }).submit(param).$promise;
        };

        service.inventoryViewSearchByPaging = function (param) {
            return $resource("/bam/wms-app/inventory-count/search-by-paging", {}, { 'search': { 'method': 'POST' } }).search(param).$promise;
        };

        service.inventoryCountRefreshSummaryData = function (param) {
            return $resource("/wms-app/inventory-count/refresh-summary-data", {}, { 'search': { 'method': 'PUT' } }).search(param).$promise;
        };

        return service;
    });
});
