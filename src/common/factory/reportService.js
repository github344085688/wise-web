/**
 * Created by Giroux on 2016/9/28.
 */

'use strict';

define([
    './factories'
], function(factories) {
    factories.factory('reportService', function($resource) {
        var services = {};
        services.searchReport = function(searchParam) {
            return $resource('/bam/wms-app/report/search', null, {'search': {method : 'POST'}}).search(searchParam).$promise;
        };
        services.searchTrackingNoReport = function(searchParam) {
            return $resource('/report-center/outbound/trackingno-report/search-by-paging', null, {'search': {method : 'POST', isArray: false}}).search(searchParam).$promise;
        };

        services.addReport = function(report) {
            return $resource("/bam/wms-app/report/create").save(report).$promise;
        };

        services.deleteReport = function(reportId) {
            return $resource("/wms-app/report/:id", {id:reportId}).delete().$promise;
        };

        services.getReportViewByFileId = function(fileId) {
            return $resource('/file-app/report-json/:fileId', {fileId:fileId}).get().$promise;
        };

        services.getReportById = function(reportId) {
            return $resource("/wms-app/report/:id", {id:reportId}).get().$promise;
        };

        var resourceConfig = {
            'update': {
                method: 'PUT'
            },
            'add': {
                method: 'POST'
            },
            'search': {
                method: 'POST',
                isArray: true
            }
        };

        services.searchReportConfiguration = function(searchParam) {
            return $resource('/bam/report-config/search', null, resourceConfig).search(searchParam).$promise;
        };

        services.enableReportConfiguration = function(id) {
            return $resource("/fd-app/report-config/enable/:id", {id:id}, resourceConfig).update().$promise;
        };

        services.disabledReportConfiguration = function(id) {
            return $resource("/fd-app/report-config/disable/:id", {id:id}, resourceConfig).update().$promise;
        };

        services.deleteReportConfiguration = function(id) {
            return $resource("/fd-app/report-config/:id", {id:id}).delete().$promise;
        };

        services.getReportConfigurationById = function (id) {
            return $resource("/fd-app/report-config/:id", {id:id}).get().$promise;
        };

        services.addReportConfiguration = function (param) {
            return $resource("/fd-app/report-config", null, resourceConfig).add(param).$promise;
        };

        services.updateReportConfiguration = function (param) {
            return $resource("/fd-app/report-config/:id", {id:param.id}, resourceConfig).update(param).$promise;
        };

        services.cngRecevingReport = function (param) {
            return $resource("/report-center/inbound/inbound-report/cng-sn-level/search", null, {'post': {method : 'POST'}}).post(param).$promise;
        };

        services.reSendReport = function (param) {
            return $resource("/report-center/report/send-report", null, {'post': {method : 'POST'}}).post(param).$promise;
        };

        services.searchPickRoundReport = function(searchParam) {
            return $resource('/report-center/outbound/pick-round-report/search-by-paging', null,  {'post': {method : 'POST'}}).post(searchParam).$promise;
        };

        services.searchShippingReport = function(searchParam) {
            return $resource('/report-center/outbound/shipping-report/order-level/search-by-paging', null,  {'post': {method : 'POST'}}).post(searchParam).$promise;
        };

        services.searchScheduleReport = function(searchParam) {
            return $resource('/report-center/outbound/schedule-report/order-level/search-by-paging', null,  {'post': {method : 'POST'}}).post(searchParam).$promise;
        };

        services.searchReceiptReport = function(searchParam) {
            return $resource('/report-center/inbound/inbound-report/receipt-level/search-by-paging', null,  {'post': {method : 'POST'}}).post(searchParam).$promise;
        };

        services.searchPickDetailReport = function(searchParam) {
            return $resource('/report-center/task/pick-detail-report/search-by-paging', null, {'search': {method : 'POST', isArray: false}}).search(searchParam).$promise;
        };

        services.searchOrderStatusReport = function(searchParam) {
            return $resource('/report-center/outbound/order-status-report/search-by-paging', null, {'search': {method : 'POST', isArray: false}}).search(searchParam).$promise;
        };
        
        services.searchLpNotShippedReportReport = function(searchParam) {
            return $resource('/report-center/lp/lp-notshiped-report/search-by-paging', null, {'search': {method : 'POST', isArray: false}}).search(searchParam).$promise;
        };

        services.searchOutOfStockReport = function(searchParam) {
            return $resource('/report-center/outbound/out-of-stock-report/search', null, {'search': {method : 'POST'}}).search(searchParam).$promise;
        };

        services.searchItemHandleTheMostReport = function(searchParam) {
            return $resource('/report-center/item-spec/handle-the-most/search', null, {'search': {method : 'POST'}}).search(searchParam).$promise;
        };

        services.agingReportReceiptLevel = function(searchParam) {
            return $resource('/report-center/inventory/aging-report-receipt-level', null, {'search': {method : 'POST'}}).search(searchParam).$promise;
        };

        services.searchLpLevel = function(searchParam) {
            return $resource('/report-center/inventory/lp-level/search-by-paging', null, {'search': {method : 'POST'}}).search(searchParam).$promise;
        };

        services.searchQtyCompareReport = function(searchParam) {
            return $resource('/report-center/outbound/qty-compare-report/search-by-paging', null, {'search': {method : 'POST'}}).search(searchParam).$promise;
        };

        return services;
    });


});