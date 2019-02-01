'use strict';

define([
    'angular',
    'src/report-center/operation/inventory/main/main',
    'src/report-center/operation/inbound/main/main',
    'src/report-center/operation/outbound/main/main',
    'src/report-center/configuration/reportConfig',
    'src/report-center/billing/billing',
], function (angular) {

    angular.module('linc.rc.main', [
        'linc.rc.operation.inventory',
        'linc.rc.operation.inbound',
        'linc.rc.operation.outbound',
        'linc.rc.configuration',
        'linc.rc.billing'
    ])
        .config(['$stateProvider', function ($stateProvider) {
            $stateProvider.state('rc.operation', {
                    url: '/operation',
                    template: '<ui-view></ui-view>'
                })
                .state('rc.configuration', {
                    url: '/configuration',
                    template: '<ui-view></ui-view>'
                })
                .state('rc.billing', {
                    url: '/billing',
                    template: '<ui-view></ui-view>'
                });
        }]);
});
