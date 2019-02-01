define([
    'angular',
    'src/report-center/operation/outbound/pick-round-report/pickRoundReportListController'
], function (angular, pickRoundReportListController) {
    angular.module('linc.rc.operation.outbound.pickRoundReport', [])
        .config(['$stateProvider', function ($stateProvider) {
            $stateProvider.state('rc.operation.outbound.pickRoundReport.list', {
                url: '/list',
                views: {
                    "unis-main@rc.operation.outbound.pickRoundReport.list": {
                        templateUrl: 'report-center/operation/outbound/pick-round-report/template/pickRoundReportList.html',
                        controller: 'pickRoundReportListController'
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
                    permissions: "report::pickRoundReport_read"
                }
            });
        }])
        .controller('pickRoundReportListController', pickRoundReportListController);
});
