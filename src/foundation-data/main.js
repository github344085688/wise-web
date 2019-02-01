'use strict';

define([
    'angular',
    'src/foundation-data/item/main/main',
    'src/foundation-data/address/main/main',
    'src/foundation-data/organization/main/main',
    'src/foundation-data/billing/main',
    'src/foundation-data/sop/main/main',
    'src/foundation-data/pending/main/main',
    'src/foundation-data/uomDefinition/main/main',
    'src/foundation-data/lp-configuration-template/main/main',
    'src/foundation-data/carrier/carrier',
    'src/foundation-data/material-template/main/main',
    'src/foundation-data/task-template/main/main',
    'src/foundation-data/milk-run/main/main',
    'src/foundation-data/location-group/main/main',
    'src/foundation-data/billing-code/billingCode',
    'src/foundation-data/uom-pick-type/uomPickType'
], function (angular) {
    angular.module('linc.fd.main', ['linc.fd.item', 'linc.fd.address',
        'linc.fd.organization', 'linc.fd.sop', 'linc.fd.billing',
        'linc.fd.pending', 'linc.fd.uomDefinition', 'linc.fd.lpConfigurationTemplate',
        'linc.fd.carrier', 'linc.fd.materialTemplate',
        'linc.fd.taskTemplate', 'linc.fd.milkRun',
        'linc.fd.location-group', 'linc.fd.billingCode', 'linc.fd.uomPickType'])
        .config(['$stateProvider', function ($stateProvider) {
            $stateProvider.state('fd.item', {
                url: '/item',
                template: '<div ui-view></div>'
            }).state('fd.address', {
                url: '/address',
                template: '<div ui-view></div>'
            }).state('fd.organization', {
                url: '/organization',
                template: '<div ui-view></div>'
            }).state('fd.billing', {
                url: '/billing',
                template: '<div ui-view></div>'
            }).state('fd.sop', {
                url: '/sop',
                template: '<div ui-view></div>'
            }).state('fd.pending', {
                url: '/pending',
                template: '<div ui-view></div>'
            }).state('fd.uomDefinition', {
                url: '/uomDefinition',
                template: '<div ui-view></div>'
            }).state('fd.lpConfigurationTemplate', {
                url: '/lp-configuration-template',
                template: '<div ui-view></div>'
            }).state('fd.carrier', {
                url: '/carrier',
                template: '<div ui-view></div>'
            }).state('fd.materialTemplate', {
                url: '/material-template',
                template: '<div ui-view></div>'
            }).state('fd.taskTemplate', {
                url: '/task-template',
                template: '<div ui-view></div>'
            }).state('fd.milkRun', {
                url: '/milk-run',
                template: '<div ui-view></div>'
            }).state('fd.location-group', {
                url: '/location-group',
                template: '<div ui-view></div>'
            }).state('fd.billingCode', {
                url: '/billing-code',
                template: '<div ui-view></div>'
            }).state('fd.uomPickType', {
                url: '/uom-pick-type',
                template: '<div ui-view></div>'
            });
        }]);
});
