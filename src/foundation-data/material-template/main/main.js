'use strict';

define([
    'angular',
    'src/foundation-data/material-template/materialTemplateListController',
    'src/foundation-data/material-template/editMaterialTemplateController',
], function (angular, materialTemplateListController, editMaterialTemplateController) {
    angular.module('linc.fd.materialTemplate', [])
        .config(['$stateProvider', function ($stateProvider) {
            $stateProvider.state('fd.materialTemplate.list', {
                url: '/list',
                views: {
                    "unis-main@fd.materialTemplate.list": {
                        templateUrl: 'foundation-data/material-template/template/materialTemplateList.html',
                        controller: 'MaterialTemplateListController',
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
                    permissions: "materialTemplate_read"
                }
            }).state('fd.materialTemplate.edit', {
                url: '/edit/:materialTemplateId',
                views: {
                    "unis-main@fd.materialTemplate.edit": {
                        templateUrl: 'foundation-data/material-template/template/editMaterialTemplate.html',
                        controller: 'EditMaterialTemplateController',
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
                    permissions: "materialTemplate_write"
                }
            }).state('fd.materialTemplate.add', {
                url: '/add',
                views: {
                    "unis-main@fd.materialTemplate.add": {
                        templateUrl: 'foundation-data/material-template/template/editMaterialTemplate.html',
                        controller: 'EditMaterialTemplateController',
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
                    permissions: "materialTemplate_write"
                }
            });
        }])
        .controller("MaterialTemplateListController", materialTemplateListController)
        .controller("EditMaterialTemplateController", editMaterialTemplateController);

});
