'use strict';

define([
    'angular',
    'src/foundation-data/lp-configuration-template/lpConfigurationSingleTemplateListPageController',
    'src/foundation-data/lp-configuration-template/editLpConfigurationSingleTemplatePageController',
    'src/foundation-data/lp-configuration-template/lpConfigurationTemplateMainPageController',
    'src/foundation-data/lp-configuration-template/lpConfigurationMultipleTemplateListPageController',
    'src/foundation-data/lp-configuration-template/editLpConfigurationMultipleTemplatePageController'
], function (angular, lpConfigurationSingleTemplateListCtrl, editLpConfigurationSingleTemplateCtrl,
             lpConfigurationTemplateMainPageCtrl, lpConfigurationMultipleTemplateListPageCtrl, editLpConfigurationMultipleTemplatePageCtrl) {
    angular.module('linc.fd.lpConfigurationTemplate', [])
        .config(['$stateProvider', function ($stateProvider) {
            $stateProvider.state('fd.lpConfigurationTemplate.main', {
                url: '/main',
                templateUrl: 'foundation-data/lp-configuration-template/template/main.html',
                controller: 'LpConfigurationTemplateMainPageCtrl',
                controllerAs: "ctrl",
                params: {
                    activeTab: null
                }
            }).state('fd.lpConfigurationTemplate.main.singleTemplateList', {
                url: '/single-template-list',
                templateUrl: 'foundation-data/lp-configuration-template/template/listSingleTemplate.html',
                controller: 'LpConfigurationSingleTemplateListCtrl',
                controllerAs: "ctrl",
                data: {
                    permissions: "lpConfigurationTemplate_read"
                }
            }).state('fd.lpConfigurationTemplate.main.singleTemplateAdd', {
                url: '/single-template-add',
                templateUrl: 'foundation-data/lp-configuration-template/template/editSingleTemplate.html',
                controller: 'EditLpConfigurationSingleTemplateCtrl',
                controllerAs: "ctrl",
                resolve: {
                    'isAddAction': function () {
                        return true;
                    }
                },
                data: {
                    permissions: "lpConfigurationTemplate_write"
                }
            }).state('fd.lpConfigurationTemplate.main.singleTemplateEdit', {
                url: '/single-template-edit/:lpConfigurationTemplateId',
                templateUrl: 'foundation-data/lp-configuration-template/template/editSingleTemplate.html',
                controller: 'EditLpConfigurationSingleTemplateCtrl',
                controllerAs: "ctrl",
                resolve: {
                    'isAddAction': function () {
                        return false;
                    }
                },
                data: {
                    permissions: "lpConfigurationTemplate_write"
                }
            }).state('fd.lpConfigurationTemplate.main.multipleTemplateList', {
                url: '/multiple-template-list',
                templateUrl: 'foundation-data/lp-configuration-template/template/listMultipleTemplate.html',
                controller: 'LpConfigurationMultipleTemplateListPageCtrl',
                controllerAs: "ctrl",
                data: {
                    permissions: "lpConfigurationTemplate_read"
                }
            }).state('fd.lpConfigurationTemplate.main.multipleTemplateAdd', {
                url: '/multiple-template-add',
                templateUrl: 'foundation-data/lp-configuration-template/template/editMultipleTemplate.html',
                controller: 'EditLpConfigurationMultipleTemplatePageCtrl',
                controllerAs: "ctrl",
                resolve: {
                    'isAddAction': function () {
                        return true;
                    }
                },
                data: {
                    permissions: "lpConfigurationTemplate_write"
                }
            }).state('fd.lpConfigurationTemplate.main.multipleTemplateEdit', {
                url: '/multiple-template-edit/:lpConfigurationTemplateId',
                templateUrl: 'foundation-data/lp-configuration-template/template/editMultipleTemplate.html',
                controller: 'EditLpConfigurationMultipleTemplatePageCtrl',
                controllerAs: "ctrl",
                resolve: {
                    'isAddAction': function () {
                        return false;
                    }
                },
                data: {
                    permissions: "lpConfigurationTemplate_write"
                }
            });
        }])
        .controller("LpConfigurationSingleTemplateListCtrl", lpConfigurationSingleTemplateListCtrl)
        .controller("EditLpConfigurationSingleTemplateCtrl", editLpConfigurationSingleTemplateCtrl)
        .controller('LpConfigurationTemplateMainPageCtrl', lpConfigurationTemplateMainPageCtrl)
        .controller('LpConfigurationMultipleTemplateListPageCtrl', lpConfigurationMultipleTemplateListPageCtrl)
        .controller('EditLpConfigurationMultipleTemplatePageCtrl', editLpConfigurationMultipleTemplatePageCtrl);
});
