'use strict';

define([
    './factories',
    'lodash'
], function(factories, _) {

    factories.factory('statisticsService', function($q, $resource) {
        var service = {};

        service.itemLineStatistics = function(orderIds) {
            var entry = $resource("/bam/outbound/order/itemLineStatistics", null, {
                'postQuery': {
                    method: 'POST'
                }
            });
            return entry.postQuery({orderIds: orderIds}).$promise;
        };

        service.summaryOrderItemline = function(orderIds) {
            var entry = $resource("/bam/outbound/order/calItemLineByOrderIds", null, {
                'postQuery': {
                    method: 'POST'
                }
            });
            return entry.postQuery({orderIds: orderIds}).$promise;
        };

        return service;
    });

});
