define([
    'angular',
    'src/report-center/operation/inventory/multiple-item-location/multipleItemLocationListController'
], function (angular,multipleItemLocationListController) {

    angular.module('linc.rc.operation.inventory.multipleItemLocation', [])
        .config(['$stateProvider', function ($stateProvider) {
            $stateProvider.state('rc.operation.inventory.multipleItemLocation.list', {
                url: '/list',
                views: {
                    "unis-main@rc.operation.inventory.multipleItemLocation.list": {
                        templateUrl: 'report-center/operation/inventory/multiple-item-location/template/multipleItemLocationList.html',
                        controller: 'multipleItemLocationListController'
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
                    permissions: "report::emptyLocation_read"
                }
            });

        }])
        .controller('multipleItemLocationListController', multipleItemLocationListController);

});
