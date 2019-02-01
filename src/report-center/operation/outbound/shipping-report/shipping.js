define([
    'angular',
    'src/report-center/operation/outbound/shipping-report/shippingReportListController',
    'src/report-center/operation/outbound/shipping-report/addShippingReportController',
    'src/report-center/operation/outbound/shipping-report/shippingReportViewController',

], function (angular, shippingReportListController,addShippingReportController,shippingReportViewController) {

    angular.module('linc.rc.operation.outbound.shipping', [])
        .config(['$stateProvider', function ($stateProvider) {
            $stateProvider.state('rc.operation.outbound.shippingReport.list', {
                url: '/list',
                views: {
                    "unis-main@rc.operation.outbound.shippingReport.list": {
                        templateUrl: 'report-center/operation/outbound/shipping-report/template/shippingReportList.html',
                        controller: 'ShippingReportListController'
                    },
                    "@": {
                        template: ""
                    },
                    "unis@": {
                        templateUrl: 'common/template/unis-main.html',
                        controller: 'DefaultMainPageController'
                    }
                },
                data: {
                    permissions: "report::shipping_read"
                }
            })
            .state('rc.operation.outbound.shippingReport.add', {
                url: '/add',
                views: {
                    "unis-main@rc.operation.outbound.shippingReport.add": {
                        templateUrl: 'report-center/operation/outbound/shipping-report/template/addShippingReport.html',
                        controller: 'AddShippingReportController'
                    },
                    "@": {
                        template: ""
                    },
                    "unis@": {
                        templateUrl: 'common/template/unis-main.html',
                        controller: 'DefaultMainPageController'
                    }
                },
                data: {
                    permissions: "report::shipping_write"
                }
            })
            .state('rc.operation.outbound.shippingReport.view', {
                url: '/view/:reportId',
                views: {
                    "unis-main@rc.operation.outbound.shippingReport.view": {
                        templateUrl: 'report-center/operation/outbound/shipping-report/template/shippingReportView.html',
                        controller: 'ShippingReportViewController'
                    },
                    "@": {
                        template: ""
                    },
                    "unis@": {
                        templateUrl: 'common/template/unis-main.html',
                        controller: 'DefaultMainPageController'
                    }
                },
                data: {
                    permissions: "report::shipping_read"
                }
            });

        }])
        .controller('ShippingReportListController', shippingReportListController)
        .controller('AddShippingReportController', addShippingReportController)   
        .controller('ShippingReportViewController', shippingReportViewController) 


});
