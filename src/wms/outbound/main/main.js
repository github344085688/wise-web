'use strict';

define([
    'angular',
    'src/wms/outbound/inventory-commitment/inventoryCommitment',
    'src/wms/outbound/load/load',
    'src/wms/outbound/order-plan/orderPlan',
    'src/wms/outbound/order/order',
    'src/wms/outbound/pack/pack',
    'src/wms/outbound/load-sequence/sequence',
    'src/wms/outbound/truck-load/truckLoad',
     'src/wms/outbound/shipment-ticket/shipmentTicket'
], function (angular) {
    angular.module('linc.wms.outbound', ['linc.wms.outbound.inventory-commitment',
        'linc.wms.outbound.load', 'linc.wms.outbound.order-plan', 'linc.wms.outbound.order',
        'linc.wms.outbound.pack', 'linc.wms.outbound.sequence', 'linc.wms.outbound.truck-load',
        'wms.outbound.shipment-ticket'
    ])
        .config(['$stateProvider',
            function ($stateProvider) {
                $stateProvider
                    .state('wms.outbound.inventoryCommitment', {
                        url: '/inventory-commitment',
                        template: '<ui-view></ui-view>'
                    })
                    .state('wms.outbound.load', {
                        url: '/load',
                        template: '<ui-view></ui-view>'
                    })
                    .state('wms.outbound.sequence', {
                        url: '/sequence',
                        template: '<ui-view></ui-view>'
                    })
                    .state('wms.outbound.truckLoad', {
                        url: '/truck-load',
                        template: '<ui-view></ui-view>',
                        controller: 'TruckLoadController'
                    })
                    .state('wms.outbound.order', {
                        url: '/order',
                        templateUrl: 'wms/outbound/order/template/order.html'
                    })
                    .state('wms.outbound.order-plan', {
                        url: '/order-plan',
                        template: '<ui-view></ui-view>'
                    })
                    .state('wms.outbound.pack', {
                        url: '/pack',
                        template: '<ui-view></ui-view>'
                    }).state('wms.outbound.shipmentTicket', {
                        url: '/shipment-ticket',
                        template: '<ui-view></ui-view>'
                    });
            }
        ]);
});
