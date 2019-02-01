define([
    'angular',
    'src/report-center/operation/outbound/open-order-report/openOrderReportListController'
], function (angular, openOrderReportListController) {
    angular.module('linc.rc.operation.outbound.openOrderReport', [])
        .config(['$stateProvider', function ($stateProvider) {
            $stateProvider.state('rc.operation.outbound.openOrderReport.list', {
                url: '/list',
                views: {
                    "unis-main@rc.operation.outbound.openOrderReport.list": {
                        templateUrl: 'report-center/operation/outbound/open-order-report/template/openOrderReportList.html',
                        controller: 'openOrderReportListController'
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
                    permissions: "report::openOrderReport_read"
                }
            });
        }])
        .controller('openOrderReportListController', openOrderReportListController);
});
