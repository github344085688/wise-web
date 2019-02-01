define([
    'angular',
    'src/report-center/operation/outbound/qty-compare-report/qtyCompareReportListController',
], function (angular, qtyCompareReportListController) {

    angular.module('linc.rc.operation.outbound.qtyCompareReport', [])
        .config(['$stateProvider', function ($stateProvider) {
            $stateProvider.state('rc.operation.outbound.qtyCompareReport.list', {
                url: '/list',
                views: {
                    "unis-main@rc.operation.outbound.qtyCompareReport.list": {
                        templateUrl: 'report-center/operation/outbound/qty-compare-report/template/qtyCompareReportList.html',
                        controller: 'qtyCompareReportListController'
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
                    permissions: "report::qtyCompare_read"
                }
            });

        }])
        .controller('qtyCompareReportListController', qtyCompareReportListController);


});
