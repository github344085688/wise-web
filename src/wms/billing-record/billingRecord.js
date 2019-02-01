'use strict';

define([
    'angular',
    'src/wms/billing-record/billingRecordListController'
], function (angular, billingRecordListController) {
    angular.module('linc.wms.billingRecord', [])
        .config(['$stateProvider', function ($stateProvider) {
            $stateProvider.state('wms.billingRecord.list', {
                url: '/list',
                templateUrl: 'wms/billing-record/template/billingRecordList.html',
                controller: 'BillingRecordListCtrl',
                data: {
                    permissions: "billingRecord_read"
                }
            });
        }])
        .controller("BillingRecordListCtrl", billingRecordListController);


});
