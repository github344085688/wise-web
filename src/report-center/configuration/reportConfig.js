'use strict';

define([
    'angular',
    'src/report-center/configuration/configInfoController',
    'src/report-center/configuration/configListController',
    'src/report-center/configuration/auto-report/autoReporConfig'
], function(angular, configInfoController, configListController) {
    angular.module('linc.rc.configuration', ['linc.rc.configuration.autoReport'])
        .config(['$stateProvider', function($stateProvider) {
            $stateProvider.state('rc.configuration.list', {
                url: '/list',
                views: {
                    "unis-main@rc.configuration.list": {
                        templateUrl: 'report-center/configuration/template/configList.html',
                        controller: 'ConfigListController'
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
                    permissions: "report::configuration_write"
                }
            })
            .state('rc.configuration.add', {
                url: '/add',
                views: {
                    "unis-main@rc.configuration.add": {
                        templateUrl: 'report-center/configuration/template/configInfo.html',
                        controller: 'ConfigInfoController',
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
                    permissions: "report::configuration_write"
                }

            }).state('rc.configuration.edit', {
                url: '/edit/:id',
                views: {
                    "unis-main@rc.configuration.edit": {
                        templateUrl: 'report-center/configuration/template/configInfo.html',
                        controller: 'ConfigInfoController',
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
                    permissions: "report::configuration_write"
                }
            }).state('rc.configuration.autoReport', {
                url: '/autoReport',
                template: '<ui-view></ui-view>'
            });
        }])
        .controller('ConfigListController', configListController)
        .controller('ConfigInfoController', configInfoController);
});

