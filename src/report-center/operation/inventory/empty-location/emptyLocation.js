define([
    'angular',
    'src/report-center/operation/inventory/empty-location/emptyLocationListController'
], function (angular,emptyLocationListController) {

    angular.module('linc.rc.operation.inventory.emptyLocation', [])
        .config(['$stateProvider', function ($stateProvider) {
            $stateProvider.state('rc.operation.inventory.emptyLocation.list', {
                url: '/list',
                views: {
                    "unis-main@rc.operation.inventory.emptyLocation.list": {
                        templateUrl: 'report-center/operation/inventory/empty-location/template/emptyLocationList.html',
                        controller: 'emptyLocationListController'
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
        .controller('emptyLocationListController', emptyLocationListController);

});
