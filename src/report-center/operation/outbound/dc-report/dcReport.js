define([
    'angular',
    'src/report-center/operation/outbound/dc-report/dcReportListController'
], function (angular, dcReportListController) {

    angular.module('linc.rc.operation.outbound.dcReport', [])
        .config(['$stateProvider', function ($stateProvider) {
            $stateProvider.state('rc.operation.outbound.dcReport.list', {
                url: '/list',
                views: {
                    "unis-main@rc.operation.outbound.dcReport.list": {
                        templateUrl: 'report-center/operation/outbound/dc-report/template/dcReportList.html',
                        controller: 'DcReportListController'
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
                    permissions: "report::dc_read"
                }
            });

        }])
        .controller('DcReportListController', dcReportListController);
    


});
