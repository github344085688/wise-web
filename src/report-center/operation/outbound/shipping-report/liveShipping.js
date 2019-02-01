define([
    'angular',
    'src/report-center/operation/outbound/shipping-report/liveShippingReportListController'
], function (angular, liveShippingReportListController) {

    angular.module('linc.rc.operation.outbound.live-shipping', [])
        .config(['$stateProvider', function ($stateProvider) {
            $stateProvider.state('rc.operation.outbound.liveShippingReport.list', {
                url: '/list',
                views: {
                    "unis-main@rc.operation.outbound.liveShippingReport.list": {
                        templateUrl: 'report-center/operation/outbound/shipping-report/template/liveShippingReportList.html',
                        controller: 'LiveShippingReportListController'
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
        .controller('LiveShippingReportListController', liveShippingReportListController);


});
