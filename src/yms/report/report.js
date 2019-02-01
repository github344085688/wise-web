'use strict';

define(['angular',
    './statusReportController',
    './activityReportController',
    './equipmentReportController'
], function(angular, statusReportController, activityReportController, equipmentReportController) {
    angular.module('linc.yms.report', [])
        .config(['$stateProvider', function($stateProvider) {
            $stateProvider.state('yms.report.statusReport', {
                url: '/status-report',
                templateUrl: 'yms/report/template/statusReport.html',
                controller: 'StatusReportController'
            }).state('yms.report.activityReport', {
                url: '/activity-report',
                templateUrl: 'yms/report/template/activityReport.html',
                controller: 'ActivityReportController'
            }).state('yms.report.equipmentReport', {
                url: '/equipment-report',
                templateUrl: 'yms/report/template/equipmentReport.html',
                controller: 'EquipmentReportController'
            });
        }])
        .controller('StatusReportController', statusReportController)
        .controller('ActivityReportController', activityReportController)
        .controller('EquipmentReportController', equipmentReportController);
});
