define([
    'angular',
    'src/report-center/operation/inventory/inventory-report/inventoryReportListController'
], function (angular,inventoryReportListController) {

    angular.module('linc.rc.operation.inventory.report', [])
        .config(['$stateProvider', function ($stateProvider) {
            $stateProvider.state('rc.operation.inventory.inventoryReport.list', {
                url: '/list',
                views: {
                    "unis-main@rc.operation.inventory.inventoryReport.list": {
                        templateUrl: 'report-center/operation/inventory/inventory-report/template/inventoryReportList.html',
                        controller: 'inventoryReportListController'
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
                    permissions: "report::inventory_read"
                }
            });

        }])
        .controller('inventoryReportListController', inventoryReportListController)
        

});
