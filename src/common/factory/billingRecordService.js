'use strict';

define([
    './factories'
], function(factories, _) {
    factories.factory('billingRecordService', function($q, $resource) {
        var resourceConfig = {
            'update': {
                method: 'PUT'
            },
            'search': {
                method: 'POST',
                isArray: true
            }
        };
        var services = {};

        services.searchBillingRecord = function(param) {
            return $resource('/wms-app/bill-record/search', null, {
                'postSearch': {
                    method: 'POST',
                    isArray: true
                }
            }).postSearch(param).$promise;
        };

        services.searchBillingRecordByPaging = function(param) {
            return $resource("/wms-app/bill-record/search-by-paging", null, {
                'postSearch': {
                    method: 'POST'
                }
            }).postSearch(param).$promise;
        };

        services.getBillingManualCode = function (param) {
            return $resource("/report-center/billing/get-billing-code", null, {
                'postSearch': {
                    method: 'POST',
                    isArray: true
                }
            }).postSearch(param).$promise;
        };

        services.getAccountItems = function (param) {
            return $resource("/report-center/billing/get-account-items", null, {
                'postSearch': {
                    method: 'POST',
                    isArray: true
                }
            }).postSearch(param).$promise;
        };

        services.saveBillingManual = function (param) {
            return $resource("/wms-app/billing/manual/batch", null, {
                'postSearch': {
                    method: 'POST'
                }
            }).postSearch(param).$promise;
        };

        services.searchBillingManual = function (param) {
            return $resource("/wms-app/billing/manual/search", null, {
                'postSearch': {
                    method: 'POST',
                    isArray: true
                }
            }).postSearch(param).$promise;
        };

        services.deleteBillingManual = function(id) {
            return $resource("/wms-app/billing/manual/:id", {id:id}).delete().$promise;
        };

        services.batchDelete = function(codeIds){
            return $resource("/wms-app/billing/manual/batch-delete", null, {
                'batchDelete': {
                    method: 'POST'
                }
            }).batchDelete(codeIds).$promise;
        };

        services.searchBillingCheckReport = function(searchParam) {
            return $resource('/report-center/billing/check/search-by-paging', null, {'search': {method : 'POST', isArray: false}}).search(searchParam).$promise;
        };
        services.sendBillingReceivingReport = function(searchParam) {
            return $resource('/report-center/billing/send-receiving-report', null, {'search': {method : 'POST', isArray: false}}).search(searchParam).$promise;
        };
        services.sendBillingShippingReport = function(searchParam) {
            return $resource('/report-center/billing/send-shipping-report', null, {'search': {method : 'POST', isArray: false}}).search(searchParam).$promise;
        };
        services.sendBillingManualChargeReport = function(searchParam) {
            return $resource('/report-center/billing/send-manual-charge-report', null, {'search': {method : 'POST', isArray: false}}).search(searchParam).$promise;
        };

        return services;
    });


});
