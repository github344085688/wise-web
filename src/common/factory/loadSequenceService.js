'use strict';

define([
    './factories'
], function(factories, _) {
    factories.factory('loadSequenceService', function($resource) {

        var service = {};

       

        service.getSequenceByLoadNo = function(loadNo) {
            return $resource("/bam/wms-app/outbound/load-sequence/:loadNo").get({
                loadNo: loadNo
            }).$promise;
        };
        service.saveSequence = function(truckLoadNo, sequence) {
            return $resource("/wms-app/outbound/truckload/:truckloadNo/load-line/sequence", null, {
                'update': {
                    method: 'PUT'
                }
            }).update({
                truckloadNo: truckLoadNo
            }, sequence).$promise;
        };
        return service;
    });
});