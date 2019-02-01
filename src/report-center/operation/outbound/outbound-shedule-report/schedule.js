define([
    'angular',
    'src/report-center/operation/outbound/outbound-shedule-report/sheduleReportListController',
    'src/report-center/operation/outbound/outbound-shedule-report/addSheduleReportController',
    'src/report-center/operation/outbound/outbound-shedule-report/sheduleReportViewController',

], function (angular, sheduleReportListController,addSheduleReportController,sheduleReportViewController) {

    angular.module('linc.rc.operation.outbound.shedule', [])
        .config(['$stateProvider', function ($stateProvider) {
            $stateProvider.state('rc.operation.outbound.sheduleReport.list', {
                url: '/list',
                views: {
                    "unis-main@rc.operation.outbound.sheduleReport.list": {
                        templateUrl: 'report-center/operation/outbound/outbound-shedule-report/template/sheduleReportList.html',
                        controller: 'SheduleReportListController'
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
                    permissions: "report::outboundSchedule_read"
                }
            })
            .state('rc.operation.outbound.sheduleReport.add', {
                url: '/add',
                views: {
                    "unis-main@rc.operation.outbound.sheduleReport.add": {
                        templateUrl: 'report-center/operation/outbound/outbound-shedule-report/template/addSheduleReport.html',
                        controller: 'AddSheduleReportController'
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
                    permissions: "report::outboundSchedule_write"
                }
            })
            .state('rc.operation.outbound.sheduleReport.view', {
                url: '/view/:reportId',
                views: {
                    "unis-main@rc.operation.outbound.sheduleReport.view": {
                        templateUrl: 'report-center/operation/outbound/outbound-shedule-report/template/sheduleReportView.html',
                        controller: 'SheduleReportViewController'
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
                    permissions: "report::outboundSchedule_read"
                }
            });

        }])
        .controller('SheduleReportListController', sheduleReportListController)
        .controller('AddSheduleReportController', addSheduleReportController)   
        .controller('SheduleReportViewController', sheduleReportViewController) 


});
