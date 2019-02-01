define([
    'angular',
    'src/report-center/operation/inbound/schedule-report/scheduleReportListController',
    'src/report-center/operation/inbound/schedule-report/addScheduleReportController',
    'src/report-center/operation/inbound/schedule-report/scheduleReportViewController',

], function (angular, scheduleReportListController,addScheduleReportController,scheduleReportViewController) {

    angular.module('linc.rc.operation.inbound.schedule', [])
        .config(['$stateProvider', function ($stateProvider) {
            $stateProvider.state('rc.operation.inbound.scheduleReport.list', {
                url: '/list',
                views: {
                    "unis-main@rc.operation.inbound.scheduleReport.list": {
                        templateUrl: 'report-center/operation/inbound/schedule-report/template/scheduleReportList.html',
                        controller: 'ScheduleReportListController'
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
            })
            .state('rc.operation.inbound.scheduleReport.add', {
                url: '/add',
                views: {
                    "unis-main@rc.operation.inbound.scheduleReport.add": {
                        templateUrl: 'report-center/operation/inbound/schedule-report/template/addScheduleReport.html',
                        controller: 'AddScheduleReportController'
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
            })
            .state('rc.operation.inbound.scheduleReport.view', {
                url: '/view/:reportId',
                views: {
                    "unis-main@rc.operation.inbound.scheduleReport.view": {
                        templateUrl: 'report-center/operation/inbound/schedule-report/template/scheduleReportView.html',
                        controller: 'ScheduleReportViewController',
                        data: {
                            permissions: "service::import_write"
                        }
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
                    permissions: "report::schedule_write"
                }
            });

        }])
        .controller('ScheduleReportListController', scheduleReportListController)
        .controller('AddScheduleReportController', addScheduleReportController)   
        .controller('ScheduleReportViewController', scheduleReportViewController) 


});
