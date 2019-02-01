define([
    'angular',
    'src/report-center/operation/inventory/new-inventory-report/inventoryReportListController'
], function (angular, newInventoryReportListController) {

    angular.module('linc.rc.operation.inventory.newReport', [])
        .config(['$stateProvider', function ($stateProvider) {
            $stateProvider.state('rc.operation.inventory.newInventoryReport.list', {
                url: '/list',
                views: {
                    "unis-main@rc.operation.inventory.newInventoryReport.list": {
                        templateUrl: 'report-center/operation/inventory/new-inventory-report/template/inventoryReportList.html',
                        controller: 'newInventoryReportListController'
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
                    permissions: "report::newInventory_read"
                }
            });

        }])
        .controller('newInventoryReportListController', newInventoryReportListController)


});
