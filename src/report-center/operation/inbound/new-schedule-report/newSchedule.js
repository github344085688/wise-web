define([
    'angular',
    'src/report-center/operation/inbound/new-schedule-report/scheduleReportListController',
], function (angular, scheduleReportListController) {

    angular.module('linc.rc.operation.inbound.newSchedule', [])
        .config(['$stateProvider', function ($stateProvider) {
            $stateProvider.state('rc.operation.inbound.newScheduleReport.list', {
                url: '/list',
                views: {
                    "unis-main@rc.operation.inbound.newScheduleReport.list": {
                        templateUrl: 'report-center/operation/inbound/new-schedule-report/template/scheduleReportList.html',
                        controller: 'scheduleReportListController'
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
                    permissions: "report::schedule_read"
                }
            });

        }])
        .controller('scheduleReportListController', scheduleReportListController);


});
