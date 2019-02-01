'use strict';

define([
    'angular',
    'src/wms/outbound/shipment-ticket/regularShipmentListController',
    'src/wms/outbound/shipment-ticket/regularShipmentViewController',
    'src/wms/outbound/shipment-ticket/smallParcelShipmentListController'
], function (angular, regularShipmentListController,
             regularShipmentViewController,
             smallParcelShipmentListController) {

    angular.module('wms.outbound.shipment-ticket', [])
        .config(['$stateProvider', function ($stateProvider) {
            $stateProvider.state('wms.outbound.shipmentTicket.list', {
                url: '/list',
                templateUrl: 'wms/outbound/shipment-ticket/template/regularShipmentList.html',
                controller: 'regularShipmentListController',
                data: {
                    permissions: "outbound::shippmentTicket_read"
                }
            })
                .state('wms.outbound.shipmentTicket.smallParcel', {
                    url: '/smallParcel',
                    templateUrl: 'wms/outbound/shipment-ticket/template/smallParcelShipmentList.html',
                    controller: 'smallParcelShipmentListController',
                    data: {
                        permissions: "outbound::shippmentTicket_read"
                    }
                })
                .state('wms.outbound.shipmentTicket.view', {
                    url: '/:ticketId',
                    templateUrl: 'wms/outbound/shipment-ticket/template/regularShipmentView.html',
                    controller: 'regularShipmentViewController',
                    data: {
                        permissions: "outbound::shippmentTicket_read"
                    }
                });

        }])
        .controller('regularShipmentListController', regularShipmentListController)
        .controller('regularShipmentViewController', regularShipmentViewController)
        .controller('smallParcelShipmentListController', smallParcelShipmentListController);
});