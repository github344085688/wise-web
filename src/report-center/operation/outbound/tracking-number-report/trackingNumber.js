define([
    'angular',
    'src/report-center/operation/outbound/tracking-number-report/trackingNumberReportListController'
], function (angular, trackingNumberReportListController) {
    angular.module('linc.rc.operation.outbound.trackingNumberReport', [])
        .config(['$stateProvider', function ($stateProvider) {
            $stateProvider.state('rc.operation.outbound.trackingNumberReport.list', {
                url: '/list',
                views: {
                    "unis-main@rc.operation.outbound.trackingNumberReport.list": {
                        templateUrl: 'report-center/operation/outbound/tracking-number-report/template/trackingNumberReportList.html',
                        controller: 'TrackingNumberReportListController'
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
                    permissions: "report::trackingNumber_read"
                }
            });
        }])
        .controller('TrackingNumberReportListController', trackingNumberReportListController);
});
