'use strict';

define([
    'angular',
    'src/report-center/operation/inbound/receiving-report/receiving',
    'src/report-center/operation/inbound/schedule-report/schedule',
    'src/report-center/operation/inbound/new-schedule-report/newSchedule',
    'src/report-center/operation/inbound/cng-receiving-report/cngReceiving'
], function (angular, controller) {
    angular.module('linc.rc.operation.inbound', ['linc.rc.operation.inbound.receiving', 'linc.rc.operation.inbound.schedule','linc.rc.operation.inbound.newSchedule',
    'linc.rc.operation.inbound.cngReceiving'])
        .config(['$stateProvider', function ($stateProvider) {
            $stateProvider.state('rc.operation.inbound', {
                url: '/inbound',
                template: '<ui-view></ui-view>'
            }).state('rc.operation.inbound.receivingReport', {
                url: '/receiving-report',
                template: '<ui-view></ui-view>'
            }).state('rc.operation.inbound.scheduleReport', {
                url: '/schedule-report',
                template: '<ui-view></ui-view>'
            }).state('rc.operation.inbound.newScheduleReport', {
                url: '/new-schedule-report',
                template: '<ui-view></ui-view>'
            }).state('rc.operation.inbound.cngReceivingReport', {
                url: '/cng-receiving-report',
                template: '<ui-view></ui-view>'
            });
        }]);
});