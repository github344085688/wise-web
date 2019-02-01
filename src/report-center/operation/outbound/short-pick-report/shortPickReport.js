define([
    'angular',
    'src/report-center/operation/outbound/short-pick-report/shortPickReportController'

], function (angular, shortPickReportController) {

    angular.module('linc.rc.operation.outbound.shortPickReport', [])
        .config(['$stateProvider', function ($stateProvider) {
            $stateProvider.state('rc.operation.outbound.shortPickReport.list', {
                url: '/list',
                views: {
                    "unis-main@rc.operation.outbound.shortPickReport.list": {
                        templateUrl: 'report-center/operation/outbound/short-pick-report/template/shortPickReport.html',
                        controller: 'ShortPickReportController'
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
                    permissions: "report::shortPick_read"
                }
            })
        }])
        .controller('ShortPickReportController', shortPickReportController);

});
