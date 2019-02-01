'use strict';

define([
    'angular',
    'src/wms/inbound/main/main',
    'src/wms/outbound/main/main',
    'src/wms/material-manage/main/main',
    'src/wms/task/main/main',
    'src/wms/billing-record/billingRecord',
    'src/wms/statistics/main',
    'src/wms/edi/edi'
], function (angular) {
    angular.module('linc.wms.main', ['linc.wms.inbound', 'linc.wms.outbound',
        'linc.wms.material-manage', 'linc.wms.task', 'linc.wms.billingRecord', 'linc.wms.statistics', 'linc.wms.edi'])
        .config(['$stateProvider', function ($stateProvider) {
            $stateProvider.state('wms.inbound', {
                url: '/inbound',
                template: '<ui-view></ui-view>'
            })
                .state('wms.outbound', {
                    url: '/outbound',
                    template: '<ui-view></ui-view>'
                })
                .state('wms.material-manage', {
                    url: '/material-manage',
                    template: '<ui-view></ui-view>'
                })
                .state('wms.task', {
                    url: '/task',
                    template: '<ui-view></ui-view>'
                })
                .state('wms.billingRecord', {
                    url: '/billing-record',
                    template: '<ui-view></ui-view>'
                })
                .state('wms.edi', {
                    url: '/edi',
                    template: '<ui-view></ui-view>'
                });
        }]);
});
