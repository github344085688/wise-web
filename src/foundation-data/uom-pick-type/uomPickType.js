'use strict';

define([
    'angular',
    'src/foundation-data/uom-pick-type/uomPickTypeListController',
    'src/foundation-data/uom-pick-type/editUomPickTypeController'
], function (angular, uomPickTypeListController, editUomPickTypeController) {
    angular.module('linc.fd.uomPickType', [])
        .config(['$stateProvider', function ($stateProvider) {
            $stateProvider.state('fd.uomPickType.list', {
                url: '/list',
                views: {
                    "unis-main@fd.uomPickType.list": {
                        templateUrl: 'foundation-data/uom-pick-type/template/uomPickTypeList.html',
                        controller: 'UomPickTypeListCtrl'
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
                    permissions: "uomPickType_read"
                }
            }).state('fd.uomPickType.add', {
                url: '/add',
                views: {
                    "unis-main@fd.uomPickType.add": {
                        templateUrl: 'foundation-data/uom-pick-type/template/editUomPickType.html',
                        controller: 'EditUomPickTypeCtrl'
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
                    permissions: "uomPickType_write"
                }
            }).state('fd.uomPickType.edit', {
                url: '/edit/:id',
                views: {
                    "unis-main@fd.uomPickType.edit": {
                        templateUrl: 'foundation-data/uom-pick-type/template/editUomPickType.html',
                        controller: 'EditUomPickTypeCtrl'
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
                    permissions: "uomPickType_write"
                }
            });
        }])
        .controller("UomPickTypeListCtrl", uomPickTypeListController)
        .controller("EditUomPickTypeCtrl", editUomPickTypeController);

});
