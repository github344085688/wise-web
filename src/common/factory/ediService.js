'use strict';

define([
    './factories'
], function (factories, _) {
    factories.factory('ediService', function ($resource, lincUtil) {


        var service = {};
        service.sendDC = function (shipmentTicketId, orderId) {
            return $resource("/bam/edi/outbound/order/shipping/confirmation", null, {
                'post': {
                    method: 'POST'
                }
            }).post({ shipmentTicketId: shipmentTicketId, orderId: orderId }).$promise;
        };

        service.searchEdiListByPaging = function (param) {
            return $resource('/wms-app/edi/search-by-paging', null, { "postQuery": { method: 'POST' } }).postQuery(param).$promise;
        };

        service.resendDC = function (shipmentTicketId, orderId) {
            return $resource("/bam/edi/resend/outbound/order/shipping/confirmation", null, {
                'post': {
                    method: 'POST'
                }
            }).post({ shipmentTicketId: shipmentTicketId, orderId: orderId }).$promise;
        };

        service.getEdiView = function (ediId) {
            return $resource('/wms-app/edi/:id').get({ id: ediId }).$promise;
        };

        return service;

    });
});
