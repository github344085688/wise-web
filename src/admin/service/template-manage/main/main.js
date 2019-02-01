'use strict';

define([
    'angular',
    'src/admin/service/template-manage/templateManagementListController',
    'src/admin/service/template-manage/editTemplateManageController',
], function (angular, templateManagementListController, editTemplateManageController) {
    angular.module('linc.admin.service.templateManagement', [])
        .config(['$stateProvider', function ($stateProvider) {
            $stateProvider.state('admin.service.templateManagement.list', {
                url: '/list',
                views: {
                    "unis-main@admin.service.templateManagement.list": {
                        templateUrl: 'admin/service/template-manage/template/templateManagementList.html',
                        controller: 'TemplateManagementListController',
                        controllerAs: "ctrl"
                    },
                    "@": {
                        template: ""
                    },
                    "unis@": {
                        templateUrl: 'common/template/unis-main.html',
                        controller: 'DefaultMainPageController'
                    }
                }

            }).state('admin.service.templateManagement.edit', {
                url: '/edit/:fileEntryId',
                views: {
                    "unis-main@admin.service.templateManagement.edit": {
                        templateUrl: 'admin/service/template-manage/template/editTemplateManagement.html',
                        controller: 'EditTemplateManageController',
                        controllerAs: "ctrl"
                    },
                    "@": {
                        template: ""
                    },
                    "unis@": {
                        templateUrl: 'common/template/unis-main.html',
                        controller: 'DefaultMainPageController'
                    }
                }

            }).state('admin.service.templateManagement.add', {
                url: '/add',
                views: {
                    "unis-main@admin.service.templateManagement.add": {
                        templateUrl: 'admin/service/template-manage/template/editTemplateManagement.html',
                        controller: 'EditTemplateManageController',
                        controllerAs: "ctrl"
                    },
                    "@": {
                        template: ""
                    },
                    "unis@": {
                        templateUrl: 'common/template/unis-main.html',
                        controller: 'DefaultMainPageController'
                    }
                }
            });
        }])
        .controller("TemplateManagementListController", templateManagementListController)
        .controller("EditTemplateManageController", editTemplateManageController);

});
