define([
    'angular',
    'src/report-center/operation/inventory/activity-report/activityReportListController',
], function (angular, activityReportListController) {
    angular.module('linc.rc.operation.inventory.activityReport', [])
        .config(['$stateProvider', function ($stateProvider) {
            $stateProvider.state('rc.operation.inventory.activityReport.list', {
                url: '/list',
                views: {
                    "unis-main@rc.operation.inventory.activityReport.list": {
                        templateUrl: 'report-center/operation/inventory/activity-report/template/activityReportList.html',
                        controller: 'ActivityReportListController'
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
                    permissions: "report::activityReport_read"
                }
            });

        }])
        .controller('ActivityReportListController',activityReportListController);



});
