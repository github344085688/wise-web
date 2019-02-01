define([
    'angular',
    'src/report-center/operation/outbound/linehaul-pick-summary/linehaulPickSummaryController'

], function (angular, linehaulPickSummaryController) {

    angular.module('linc.rc.operation.outbound.linehaulPickSummary', [])
        .config(['$stateProvider', function ($stateProvider) {
            $stateProvider.state('rc.operation.outbound.linehaulPickSummary', {
                url: '/linehaul-pick-summary',
                views: {
                    "unis-main@rc.operation.outbound.linehaulPickSummary": {
                        templateUrl: 'report-center/operation/outbound/linehaul-pick-summary/template/linehaulPickSummary.html',
                        controller: 'LinehaulPickSummaryController'
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
                    permissions: "report::lineHaulPickSummary_read"
                }
            })
        }])
        .controller('LinehaulPickSummaryController', linehaulPickSummaryController);

});
