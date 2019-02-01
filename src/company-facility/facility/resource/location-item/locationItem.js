'use strict';
define([
    'angular',
    'src/company-facility/facility/resource/location-item/locationItemListController',
    'src/company-facility/facility/resource/location-item/addLocationItemController'
], function (angular, locationItemListController,addLocationItemController) {
    angular.module('linc.cf.facility.resource.locationItem', [])
        .config(['$stateProvider', function ($stateProvider) {
            $stateProvider.state('cf.facility.resource.locationItem.list', {
                url: '/list',
                views: {
                    "unis-main@cf.facility.resource.locationItem.list": {
                        templateUrl: 'company-facility/facility/resource/location-item/template/locationItemList.html',
                        controller: 'LocationItemListController',
                        controllerAs: "ctrl"
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
                    permissions: "facility::locationItem_read"
                }
            }).state('cf.facility.resource.locationItem.add', {
                url: '/add',
                views: {
                    "unis-main@cf.facility.resource.locationItem.add": {
                        templateUrl: 'company-facility/facility/resource/location-item/template/addLocationItem.html',
                        controller: 'AddLocationItemController',
                        controllerAs: "ctrl"
                    },
                    "@": {
                        template: ""
                    },
                    "unis@": {
                        templateUrl: 'common/template/unis-main.html',
                        controller: 'DefaultMainPageController'
                    },

                },
                resolve: {
                    'isAddAction': function () {
                        return true;
                    }
                },
                data: {
                    permissions: "facility::locationItem_write"
                }
            })
        }])
        .controller("LocationItemListController", locationItemListController)
        .controller("AddLocationItemController", addLocationItemController);
});