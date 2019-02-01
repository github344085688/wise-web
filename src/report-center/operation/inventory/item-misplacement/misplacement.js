define([
    'angular',
    'src/report-center/operation/inventory/item-misplacement/itemMisplacementListController'
], function (angular,itemMisplacementListController) {

    angular.module('linc.rc.operation.inventory.misplacement', [])
        .config(['$stateProvider', function ($stateProvider) {
            $stateProvider.state('rc.operation.inventory.itemMisplacement.list', {
                url: '/list',
                views: {
                    "unis-main@rc.operation.inventory.itemMisplacement.list": {
                        templateUrl: 'report-center/operation/inventory/item-misplacement/template/itemMisplacementList.html',
                        controller: 'itemMisplacementListController'
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
                    permissions: "report::itemMisplacement_read"
                }
            });

        }])
        .controller('itemMisplacementListController', itemMisplacementListController);

});
