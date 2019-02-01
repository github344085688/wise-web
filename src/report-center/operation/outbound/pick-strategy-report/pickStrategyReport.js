define([
    'angular',
    'src/report-center/operation/outbound/pick-strategy-report/pickStrategyReportController'

], function (angular, pickStrategyReportController) {

    angular.module('linc.rc.operation.outbound.pickStrategyReport', [])
        .config(['$stateProvider', function ($stateProvider) {
            $stateProvider.state('rc.operation.outbound.pickStrategyReport.list', {
                url: '/list',
                views: {
                    "unis-main@rc.operation.outbound.pickStrategyReport.list": {
                        templateUrl: 'report-center/operation/outbound/pick-strategy-report/template/pickStrategyReport.html',
                        controller: 'PickStrategyReportController'
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
                    permissions: "report::pickStrategy_read"
                }
            })
        }])
        .controller('PickStrategyReportController', pickStrategyReportController);

});
