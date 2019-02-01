'use strict';

define([
    'angular',
    'src/wms/outbound/inventory-commitment/commitmentReportController',
    'src/wms/outbound/inventory-commitment/buildCommitmentController'
], function (angular, commitmentReportCtrl, buildCommitmentCtrl) {
    angular.module('linc.wms.outbound.inventory-commitment', [])
        .config(['$stateProvider', function($stateProvider) {
            $stateProvider.state('wms.outbound.inventoryCommitment.buildCommitment', {
                url: '/buildCommitment',
                templateUrl: 'wms/outbound/inventory-commitment/template/buildCommitment.html',
                controller: 'outbound.buildCommitmentController',
                data: {
                    title: "Build Commitment",
                    permissions: "outbound::commitment_write"
                }
            })
            .state('wms.outbound.inventoryCommitment.commitmentReport', {
                url: '/commitmentReport',
                templateUrl: 'wms/outbound/inventory-commitment/template/commitmentReport.html',
                controller: 'outbound.commitmentReportController',
                data: {
                    title: "Commitment Report",
                    permissions: "outbound::commitment_read"
                },
                params:{
                    batchCommitmentNo: null
                }
            });
        }])
        .controller('outbound.buildCommitmentController', buildCommitmentCtrl)
        .controller('outbound.commitmentReportController', commitmentReportCtrl);
});