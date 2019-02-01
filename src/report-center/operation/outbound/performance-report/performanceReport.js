define([
    'angular',
    'src/report-center/operation/outbound/performance-report/performanceReportController'
], function (angular, performanceReportController) {
    angular.module('linc.rc.operation.outbound.performanceReport', [])
        .config(['$stateProvider', function ($stateProvider) {
            $stateProvider.state('rc.operation.outbound.performanceReport.list', {
                url: '/list',
                views: {
                    "unis-main@rc.operation.outbound.performanceReport.list": {
                        templateUrl: 'report-center/operation/outbound/performance-report/template/performanceReport.html',
                        controller: 'performanceReportController'
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
                    permissions: "report::performanceReport_read"
                }
            });
        }])
        .controller('performanceReportController', performanceReportController);
});
