'use strict';
define([
    './factories',
    'lodash',
    'angular'
], function (factories, _, angular) {
    factories.factory('shipmentTicketService', function ($q, $resource) {
        var service = {};
        service.searchShippmentTickets=function(params){
           return $resource('/bam/outbound/shipment-ticket/search-by-paging',null,
               {'search': {method : 'POST'}}).search(params).$promise;
        };
     
        service.getShippmentTicketById=function(ticketId){
              return $resource('/bam/outbound/shipment-ticket/:ticketId',{ ticketId: ticketId}).get().$promise;
        };

        service.closeShippmentTicket=function(ticketId){
            return $resource('/wms-app/outbound/shipment-ticket/:ticketId/close',{ ticketId: ticketId},
                {'update': {method : 'PUT'}}).update().$promise;
        };
       
        return service;
    });
});