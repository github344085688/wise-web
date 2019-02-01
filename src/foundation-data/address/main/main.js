'use strict';

define([
    'angular',
    'src/foundation-data/address/addressListPageController',
    'src/foundation-data/address/editAddressPageController',
    'src/foundation-data/address/addressService'
], function (angular, addressListCtrl, editAddressCtrl, addressService) {

    angular.module('linc.fd.address', [])
        .config(['$stateProvider', function ($stateProvider) {
            $stateProvider.state('fd.address.list', {
                url: '/list',
                views: {
                    "unis-main@fd.address.list": {
                        templateUrl: 'foundation-data/address/template/addressList.html',
                        controller: 'AddressListPageController',
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
                    permissions: "address_read"
                }
            }).state('fd.address.add', {
                url: '/add',
                views: {
                    "unis-main@fd.address.add": {
                        templateUrl: 'foundation-data/address/template/editAddress.html',
                        controller: 'EditAddressPageController',
                        controllerAs: "ctrl",
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
                    permissions: "address_write"
                }
            }).state('fd.address.edit', {
                url: '/edit/:addressId',
                views: {
                    "unis-main@fd.address.edit": {
                        templateUrl: 'foundation-data/address/template/editAddress.html',
                        controller: 'EditAddressPageController',
                        controllerAs: "ctrl",
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
                    permissions: "address_write"
                }
            });
        }])
        .factory("addressService", addressService)
        .controller("AddressListPageController", addressListCtrl)
        .controller("EditAddressPageController", editAddressCtrl);

});
