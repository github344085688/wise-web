define([
    'angular',
    'src/report-center/operation/outbound/daily-summary-report/dailySummaryReportController'

], function (angular, dailySummaryReportController) {

    angular.module('linc.rc.operation.outbound.dailySummaryReport', [])
        .config(['$stateProvider', function ($stateProvider) {
            $stateProvider.state('rc.operation.outbound.dailySummaryReport.list', {
                url: '/list',
                views: {
                    "unis-main@rc.operation.outbound.dailySummaryReport.list": {
                        templateUrl: 'report-center/operation/outbound/daily-summary-report/template/dailySummaryReport.html',
                        controller: 'DailySummaryReportController'
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
                    permissions: "report::dailySummary_read"
                }
            })
        }])
        .controller('DailySummaryReportController', dailySummaryReportController);

});
