'use strict';

define([
    'angular',
    'src/report-center/operation/outbound/shipping-report/shipping',
    'src/report-center/operation/outbound/shipping-report/liveShipping',
    'src/report-center/operation/outbound/outbound-shedule-report/schedule',
    'src/report-center/operation/outbound/new-outbound-shedule-report/newSchedule',
    'src/report-center/operation/outbound/daily-summary-report/dailySummaryReport',
    'src/report-center/operation/outbound/linehaul-pick-summary/linehaulPickSummary',
    'src/report-center/operation/outbound/pick-detail-report/pickDetailReport',
    'src/report-center/operation/outbound/pick-strategy-report/pickStrategyReport',
    'src/report-center/operation/outbound/dc-report/dcReport',
    'src/report-center/operation/outbound/short-pick-report/shortPickReport',
    'src/report-center/operation/outbound/shipping-label-report/smallParcelShipmentReport',
    'src/report-center/operation/outbound/tracking-number-report/trackingNumber',
    'src/report-center/operation/outbound/pick-round-report/pickRoundReport',
    'src/report-center/operation/outbound/open-order-report/openOrderReport',
    'src/report-center/operation/outbound/performance-report/performanceReport',
    'src/report-center/operation/outbound/lp-not-shipped-report/lpNotShippedReportReport',
    'src/report-center/operation/outbound/out-of-stock-report/outOfStockReport',
    'src/report-center/operation/outbound/qty-compare-report/qtyCompareReport'
], function (angular) {

    angular.module('linc.rc.operation.outbound', [
        'linc.rc.operation.outbound.shipping',
        'linc.rc.operation.outbound.live-shipping',
        'linc.rc.operation.outbound.shedule',
        'linc.rc.operation.outbound.newSchedule',
        'linc.rc.operation.outbound.dailySummaryReport',
        'linc.rc.operation.outbound.linehaulPickSummary',
        'linc.rc.operation.outbound.pickDetailReport',
        'linc.rc.operation.outbound.pickStrategyReport',
        'linc.rc.operation.outbound.dcReport',
        'linc.rc.operation.outbound.shortPickReport',
        'linc.rc.operation.outbound.smallParcelShipmentReport',
        'linc.rc.operation.outbound.trackingNumberReport',
        'linc.rc.operation.outbound.pickRoundReport',
        'linc.rc.operation.outbound.openOrderReport',
        'linc.rc.operation.outbound.performanceReport',
        'linc.rc.operation.outbound.lpNotShippedReport',
        'linc.rc.operation.outbound.outOfStockReport',
        'linc.rc.operation.outbound.qtyCompareReport'
    ])
        .config(['$stateProvider', function ($stateProvider) {
            $stateProvider.state('rc.operation.outbound', {
                url: '/outbound',
                template: '<ui-view></ui-view>'
            }).state('rc.operation.outbound.dailySummaryReport', {
                url: '/daily-summary-report',
                template: '<ui-view></ui-view>'
            }).state('rc.operation.outbound.sheduleReport', {
                url: '/outbound-shedule-report',
                template: '<ui-view></ui-view>'
            }).state('rc.operation.outbound.newScheduleReport', {
                url: '/new-outbound-shedule-report',
                template: '<ui-view></ui-view>'
            }).state('rc.operation.outbound.pickDetailReport', {
                url: '/pick-detail-report',
                template: '<ui-view></ui-view>'
            }).state('rc.operation.outbound.pickStrategyReport', {
                url: '/pick-strategy-report',
                template: '<ui-view></ui-view>'
            }).state('rc.operation.outbound.shippingReport', {
                url: '/shipping-report',
                template: '<ui-view></ui-view>'
            }).state('rc.operation.outbound.liveShippingReport', {
                url: '/live-shipping-report',
                template: '<ui-view></ui-view>'
            }).state('rc.operation.outbound.dcReport', {
                url: '/dc-report',
                template: '<ui-view></ui-view>'
            }).state('rc.operation.outbound.shortPickReport', {
                url: '/short-pick-report',
                template: '<ui-view></ui-view>'
            }).state('rc.operation.outbound.smallParcelShipmentReport', {
                url: '/shipping-label-report',
                template: '<ui-view></ui-view>'
            }).state('rc.operation.outbound.trackingNumberReport', {
                url: '/tracking-number-report',
                template: '<ui-view></ui-view>'
            }).state('rc.operation.outbound.pickRoundReport', {
                url: '/pick-round-report',
                template: '<ui-view></ui-view>'
            }).state('rc.operation.outbound.openOrderReport', {
                url: '/open-order-report',
                template: '<ui-view></ui-view>'
            }).state('rc.operation.outbound.performanceReport', {
                url: '/performance-report',
                template: '<ui-view></ui-view>'
            }).state('rc.operation.outbound.lpNotShippedReport', {
                url: '/lp-not-shipped-report',
                template: '<ui-view></ui-view>'
            }).state('rc.operation.outbound.outOfStockReport', {
                url: '/out-of-stock-report',
                template: '<ui-view></ui-view>'
            }).state('rc.operation.outbound.qtyCompareReport', {
                url: '/qty-compare-report',
                template: '<ui-view></ui-view>'
            });
        }]);
});

