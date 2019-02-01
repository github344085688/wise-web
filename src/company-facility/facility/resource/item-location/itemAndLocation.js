'use strict';
define([
    'angular',
    'src/company-facility/facility/resource/item-location/itemAndLocationListController',
    'src/company-facility/facility/resource/item-location/editItemAndLocationController'
], function (angular, itemAndLocationListController, editItemAndLocationController) {
    angular.module('linc.cf.facility.resource.itemAndLocation', [])
        .config(['$stateProvider', function ($stateProvider) {
            $stateProvider.state('cf.facility.resource.itemAndLocation.list', {
                url: '/list',
                views: {
                    "unis-main@cf.facility.resource.itemAndLocation.list": {
                        templateUrl: 'company-facility/facility/resource/item-location/template/itemAndLocationList.html',
                        controller: 'ItemAndLocationListController',
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
                    permissions: "facility::itemLocation_read"
                }
            }).state('cf.facility.resource.itemAndLocation.add', {
                url: '/add',
                views: {
                    "unis-main@cf.facility.resource.itemAndLocation.add": {
                        templateUrl: 'company-facility/facility/resource/item-location/template/editItemAndLocation.html',
                        controller: 'EditItemAndLocationController',
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
                    permissions: "facility::itemLocation_write"
                }
            }).state('cf.facility.resource.itemAndLocation.edit', {
                url: '/edit/:itemLocationId',
                views: {
                    "unis-main@cf.facility.resource.itemAndLocation.edit": {
                        templateUrl: 'company-facility/facility/resource/item-location/template/editItemAndLocation.html',
                        controller: 'EditItemAndLocationController',
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
                resolve: {
                    'isAddAction': function () {
                        return false;
                    }
                },
                data: {
                    permissions: "facility::itemLocation_write"
                }
            })
        }])
        .controller("ItemAndLocationListController", itemAndLocationListController)
        .controller("EditItemAndLocationController", editItemAndLocationController);
});