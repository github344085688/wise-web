'use strict';

define([
    './factories'
], function(factories, _) {
    factories.factory('truckLoadService', function($resource) {
        var service = {};

        service.getTruckLoadByTruckLoadNo = function(truckLoadNo) {
            return $resource('/bam/outbound/truckload/:truckloadNo').get({
                truckloadNo: truckLoadNo
            }).$promise;
        };

        service.addTruckLoad = function(truckLoad) {
            return $resource('/wms-app/outbound/truckload').save(truckLoad).$promise;
        };

        service.updateTruckLoad = function(truckLoad) {
            return $resource('/wms-app/outbound/truckload/:truckloadNo', null, {
                'update': {
                    method: 'PUT'
                }
            }).update({
                truckloadNo: truckLoad.truckLoadNo
            }, truckLoad).$promise;
        };

        service.searchTruckLoad = function(truckLoad) {
            return $resource('/bam/outbound/truckload/search', null, {
                'postQuery': {
                    method: 'POST'
                }
            }).postQuery(truckLoad).$promise;
        };

        service.removeTruckLoad = function(truckloadNo) {
            return $resource('/wms-app/outbound/truckload/:truckloadNo').delete({truckloadNo: truckloadNo}).$promise;
        };

        return service;
    });
});
