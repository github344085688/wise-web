define([
    'angular',
    'src/report-center/operation/outbound/pick-detail-report/pickDetailReportController'

], function (angular, pickDetailReportController) {

    angular.module('linc.rc.operation.outbound.pickDetailReport', [])
        .config(['$stateProvider', function ($stateProvider) {
            $stateProvider.state('rc.operation.outbound.pickDetailReport.list', {
                url: '/list',
                views: {
                    "unis-main@rc.operation.outbound.pickDetailReport.list": {
                        templateUrl: 'report-center/operation/outbound/pick-detail-report/template/pickDetailReport.html',
                        controller: 'PickDetailReportController'
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
                    permissions: "report::pickDetail_read"
                }
            })
        }])
        .controller('PickDetailReportController', pickDetailReportController);

});
