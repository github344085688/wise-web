'use strict';

define([
    'angular',
    'src/dashboard/monitor/document-overview/documentOverviewController',
    'src/dashboard/monitor/document-progress/documentProgressController',
    'src/dashboard/monitor/new-dashboards/newDashboardsController',
    'src/dashboard/monitor/new-dashboards/newDashboardsSettingController'
], function (angular, documentOverviewController, documentProgressController,newDashboardsController,newDashboardsSettingController) {
    angular.module('linc.dashboard.monitor', [])
        .config(['$stateProvider', function ($stateProvider) {
            $stateProvider.state('dashboard.monitor.documentOverview', {
                url: '/dc-overview',
                templateUrl: 'dashboard/monitor/document-overview/template/documentOverview.html',
                controller: documentOverviewController,
                data: {
                    title: "document Overview"
                }
            }).state('dashboard.monitor.documentProgress', {
                url: '/dc-progress',
                templateUrl: 'dashboard/monitor/document-progress/template/documentProgress.html',
                controller: documentProgressController,
                data: {
                    title: "document Progress"
                }
            }).state('dashboard.monitor.newDashboards', {
                url: '/new-dashboards',
                templateUrl: 'dashboard/monitor/new-dashboards/template/newDashboards.html',
                controller: newDashboardsController,
                data: {
                    title: "document Progress"
                }
            }).state('dashboard.monitor.newDashboardsSetting', {
                url: '/new-dashboards-setting',
                templateUrl: 'dashboard/monitor/new-dashboards/template/newDashboardsSetting.html',
                controller: newDashboardsSettingController,
                data: {
                    title: "document Progress"
                }
            })

        }]).controller('documentOverviewController', documentOverviewController)
        .controller('documentProgressController', documentProgressController)
        .controller('newDashboardsController', newDashboardsController)
        .controller('newDashboardsSettingController', newDashboardsSettingController);
});