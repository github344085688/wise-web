define([
    'angular',
    'src/report-center/operation/inventory/adjustment-report/adjustmentReportListController'
], function (angular,adjustmentReportListController) {

    angular.module('linc.rc.operation.inventory.adjustment', [])
        .config(['$stateProvider', function ($stateProvider) {
            $stateProvider.state('rc.operation.inventory.adjustmentReport.list', {
                url: '/list',
                views: {
                    "unis-main@rc.operation.inventory.adjustmentReport.list": {
                        templateUrl: 'report-center/operation/inventory/adjustment-report/template/adjustmentReportList.html',
                        controller: 'adjustmentReportListController'
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
                    permissions: "report::inventoryAdjustment_read"
                }
            });

        }])
        .controller('adjustmentReportListController', adjustmentReportListController)
        

});
