'use strict';

define([
    'angular',
    'src/wms/material-manage/materialManageListController',
    'src/wms/material-manage/editMaterialManageController',
    'src/wms/material-manage/autoGenerationCustomerMaterialListController'
], function (angular, materialManageListController, editMaterialManageController, autoGenerationCustomerMaterialListController) {
    angular.module('linc.wms.material-manage', [])
        .config(['$stateProvider', function ($stateProvider) {
            $stateProvider.state('wms.material-manage.list', {
                url: '/list',
                templateUrl: 'wms/material-manage/template/materialManageList.html',
                controller: 'MaterialManageListController',
                controllerAs: "ctrl",
                data: {
                    permissions: "materialManage_read"
                }
            }).state('wms.material-manage.edit', {
                url: '/edit/:materialLineId',
                templateUrl: 'wms/material-manage/template/editMaterialManage.html',
                controller: 'EditMaterialManageController',
                controllerAs: "ctrl",
                data: {
                    permissions: "materialManage_write"
                }
            }).state('wms.material-manage.add', {
                url: '/add',
                templateUrl: 'wms/material-manage/template/editMaterialManage.html',
                controller: 'EditMaterialManageController',
                controllerAs: "ctrl",
                data: {
                    permissions: "materialManage_write"
                }
            }).state('wms.material-manage.customer-material',  {
                url: '/customer-material',
                views: {
                    "unis-main@wms.material-manage.customer-material": {
                        templateUrl: 'wms/material-manage/template/autoGenerationCustomerMaterialList.html',
                        controller: 'AutoGenerationCustomerMaterialListController'
                    },
                    "@": {
                        template: ""
                    },
                    "unis@": {
                        templateUrl: 'common/template/unis-main.html',
                        controller: 'DefaultMainPageController'
                    }
                },
            });
        }])
        .controller("MaterialManageListController", materialManageListController)
        .controller("EditMaterialManageController", editMaterialManageController)
        .controller("AutoGenerationCustomerMaterialListController", autoGenerationCustomerMaterialListController);
});
