define([
    'angular',
    'src/report-center/operation/inventory/legacy-inventory-make-pallet-report/legacyInventoryMakePalletListController'
], function (angular,legacyInventoryMakePalletListController) {

    angular.module('linc.rc.operation.inventory.legacyInventoryMakePalletReport', [])
        .config(['$stateProvider', function ($stateProvider) {
            $stateProvider.state('rc.operation.inventory.legacyInventoryMakePalletReport.list', {
                url: '/list',
                views: {
                    "unis-main@rc.operation.inventory.legacyInventoryMakePalletReport.list": {
                        templateUrl: 'report-center/operation/inventory/legacy-inventory-make-pallet-report/template/legacyInventoryMakePalletList.html',
                        controller: 'legacyInventoryMakePalletListController'
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
        .controller('legacyInventoryMakePalletListController', legacyInventoryMakePalletListController);

});
