define([
    'angular',
    'src/report-center/operation/inbound/receiving-report/receivingReportListController'
], function (angular, receivingReportListController) {
    angular.module('linc.rc.operation.inbound.receiving', [])
        .config(['$stateProvider', function ($stateProvider) {
            $stateProvider.state('rc.operation.inbound.receivingReport.list', {
                url: '/list',
                views: {
                    "unis-main@rc.operation.inbound.receivingReport.list": {
                        templateUrl: 'report-center/operation/inbound/receiving-report/template/receivingReportList.html',
                        controller: 'ReceivingReportListController'
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
                    permissions: "report::receiving_read"
                }
            });
        }])
        .controller('ReceivingReportListController', receivingReportListController);



});
