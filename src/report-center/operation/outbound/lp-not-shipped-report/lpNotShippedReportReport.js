define([
    'angular',
    'src/report-center/operation/outbound/lp-not-shipped-report/lpNotShippedReportListController'
], function (angular, lpNotShippedReportListController) {
    angular.module('linc.rc.operation.outbound.lpNotShippedReport', [])
        .config(['$stateProvider', function ($stateProvider) {
            $stateProvider.state('rc.operation.outbound.lpNotShippedReport.list', {
                url: '/list',
                views: {
                    "unis-main@rc.operation.outbound.lpNotShippedReport.list": {
                        templateUrl: 'report-center/operation/outbound/lp-not-shipped-report/template/lpNotShippedReportList.html',
                        controller: 'lpNotShippedReportListController'
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
                    permissions: "report::lpNotShippedReport_read"
                }
            });
        }])
        .controller('lpNotShippedReportListController', lpNotShippedReportListController);
});
