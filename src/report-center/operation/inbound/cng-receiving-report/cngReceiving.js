define([
    'angular',
    'src/report-center/operation/inbound/cng-receiving-report/cngReceivingReportListController',
], function (angular, cngReceivingReportListController) {
    angular.module('linc.rc.operation.inbound.cngReceiving', [])
        .config(['$stateProvider', function ($stateProvider) {
            $stateProvider.state('rc.operation.inbound.cngReceivingReport.list', {
                url: '/list',
                views: {
                    "unis-main@rc.operation.inbound.cngReceivingReport.list": {
                        templateUrl: 'report-center/operation/inbound/cng-receiving-report/template/cngReceivingReportList.html',
                        controller: 'CngReceivingReportListController'
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
                    permissions: "report::cngReceiving_read"
                }
            });

        }])
        .controller('CngReceivingReportListController',cngReceivingReportListController);



});
