define([
    'angular',
    'src/report-center/operation/outbound/new-outbound-shedule-report/sheduleReportListController',
], function (angular, newSheduleReportListController) {

    angular.module('linc.rc.operation.outbound.newSchedule', [])
        .config(['$stateProvider', function ($stateProvider) {
            $stateProvider.state('rc.operation.outbound.newScheduleReport.list', {
                url: '/list',
                views: {
                    "unis-main@rc.operation.outbound.newScheduleReport.list": {
                        templateUrl: 'report-center/operation/outbound/new-outbound-shedule-report/template/sheduleReportList.html',
                        controller: 'NewSheduleReportListController'
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
        .controller('NewSheduleReportListController', newSheduleReportListController);


});
