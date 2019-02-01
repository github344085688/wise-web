'use strict';

define([
    'angular',
    'src/foundation-data/billing-code/billingCodeListController',
    'src/foundation-data/billing-code/editBillingCodeController'
], function (angular, billingCodeListController, editBillingCodeController) {
    angular.module('linc.fd.billingCode', [])
        .config(['$stateProvider', function ($stateProvider) {
            $stateProvider.state('fd.billingCode.list', {
                url: '/list',
                views: {
                    "unis-main@fd.billingCode.list": {
                        templateUrl: 'foundation-data/billing-code/template/billingCodeList.html',
                        controller: 'BillingCodeListCtrl'
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
                    permissions: "billingCode_read"
                }
            }).state('fd.billingCode.add', {
                url: '/add',
                views: {
                    "unis-main@fd.billingCode.add": {
                        templateUrl: 'foundation-data/billing-code/template/editBillingCode.html',
                        controller: 'EditBillingCodeCtrl'
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
                    permissions: "billingCode_write"
                }
            }).state('fd.billingCode.edit', {
                url: '/edit/:codeId',
                views: {
                    "unis-main@fd.billingCode.edit": {
                        templateUrl: 'foundation-data/billing-code/template/editBillingCode.html',
                        controller: 'EditBillingCodeCtrl'
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
                    permissions: "billingCode_write"
                }
            });
        }])
        .controller("BillingCodeListCtrl", billingCodeListController)
        .controller("EditBillingCodeCtrl", editBillingCodeController);

});
