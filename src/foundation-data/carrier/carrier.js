'use strict';

define([
    'angular',
    'src/foundation-data/carrier/carrierListController',
    'src/foundation-data/carrier/editCarrierController'
], function (angular, carrierListController, editCarrierController) {
    angular.module('linc.fd.carrier', [])
        .config(['$stateProvider', function ($stateProvider) {
            $stateProvider.state('fd.carrier.list', {
                url: '/list',
                views: {
                    "unis-main@fd.carrier.list": {
                        templateUrl: 'foundation-data/carrier/template/carrierList.html',
                        controller: 'CarrierListCtrl',
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
                    permissions: "carrier_read"
                }
            }).state('fd.carrier.add', {
                url: '/add',
                views: {
                    "unis-main@fd.carrier.add": {
                        templateUrl: 'foundation-data/carrier/template/editCarrier.html',
                        controller: 'EditCarrierCtrl'
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
                        return true;
                    }
                },
                data: {
                    permissions: "carrier_write"
                }
            }).state('fd.carrier.edit', {
                url: '/edit/:carrierId',
                views: {
                    "unis-main@fd.carrier.edit": {
                        templateUrl: 'foundation-data/carrier/template/editCarrier.html',
                        controller: 'EditCarrierCtrl'
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
                    permissions: "carrier_write"
                }
            });
        }])
        .controller("CarrierListCtrl", carrierListController)
        .controller("EditCarrierCtrl", editCarrierController);

});
