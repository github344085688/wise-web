'use strict';

define([
    'angular',
    'src/report-center/configuration/auto-report/autoReportListController'
], function(angular, autoReportListController) {
    angular.module('linc.rc.configuration.autoReport', [])
        .config(['$stateProvider', function($stateProvider) {
            $stateProvider.state('rc.configuration.autoReport.list', {
                url: '/list',
                views: {
                    "unis-main@rc.configuration.autoReport.list": {
                        templateUrl: 'report-center/configuration/auto-report/template/autoReportList.html',
                        controller: 'autoReportListController'
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
                    permissions: "report::autoReport_write"
                }
            });
        }])
        .controller('autoReportListController', autoReportListController);
});

