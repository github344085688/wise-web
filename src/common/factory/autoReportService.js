'use strict';

define([
    './factories',
    'lodash',
    'angular'
], function(factories, _, angular) {

    factories.factory('autoDailyService', function($q, $resource) {
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
        service.autoReportTraceSearch = function (params) {
            return $resource("/bam/auto-report-trace/search", null, {'search': {method : 'POST'}}).search(params).$promise;
        };

        service.autoDailyOrderProcessReport = function (params) {
            return $resource("/wms-app/auto-daily-order-process/report", null, resourceConfig).search(params).$promise;
        };

        service.autoDailyOrderProcessReportTpv = function (params) {
            return $resource("/wms-app/transload/daily-order-process-report/tpv", null, resourceConfig).search(params).$promise;
        };

        service.autoDailyInventoryReport = function (params) {
            return $resource("/wms-app/auto-daily-inventory/report", null, resourceConfig).search(params).$promise;
        };

        service.autoDailyInboundReport = function (params) {
            return $resource("/message-handler-app/auto-daily-inbound/report", null, resourceConfig).search(params).$promise;
        };
        service.autoDailyoutboundReport = function (params) {
            return $resource("/message-handler-app/auto-daily-outbound/report", null, resourceConfig).search(params).$promise;
        };

        service.importsGroupInventoryReport = function (params) {
            return $resource("/message-handler-app/report/import-group-inventory-report", null, resourceConfig).search(params).$promise;
        };

        service.containerPODMonitorDailyReport = function (params) {
            return $resource("/wms-app/auto-container-pod-monitor-daily-report", null, resourceConfig).search(params).$promise;
        };

        service.dailyDataComparisonReportForTPVandAMTRANRCDC = function (params) {
            return $resource("/wms-app/daily-data-comparison-report-for-supplier/rc-dc", null, {'search': {method : 'POST'}}).search(params).$promise;
        };

        return service;
    });

});
