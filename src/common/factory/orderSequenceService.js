'use strict';

define([
    './factories'
], function(factories, _) {
    factories.factory('orderSequenceService', function($resource) {
        var service = {};
        service.getSequenceByLoadId = function(loadId) {
            return $resource("/bam/wms-app/outbound/order-sequence/:loadId").get({
                loadId: loadId
            }).$promise;
        };
        service.saveSequence = function(loadId, sequence) {
            return $resource("/wms-app/outbound/load/:loadId/order-line/sequence", null, {
                'update': {
                    method: 'PUT'
                }
            }).update({
                loadId: loadId
            }, sequence).$promise;
        };
        return service;
    });
});