'use strict';
define([
    './factories',
    'lodash',
    'angular'
], function (factories, _, angular) {
    factories.factory('smallParcelShipmentService', function ($q, $resource) {
        var service = {};
        service.searchSmallParcelShipmentsByPaging=function(params){
           return $resource('/bam/small-parcel-shipment/search-by-paging',null,
               {'search': {method : 'POST'}}).search(params).$promise;
        };

        service.searchSmallParcelShipmentDetail = function (params) {
            return $resource('/bam/wms-app/small-parcel-shipment/shipment-detail/search', null, {
                'search': {
                    method: 'POST',
                    isArray: true
                }
            }).search(params).$promise;
        };

        service.createSmallParcelShipment = function (params) {
            return $resource('/wms-app/small-parcel-shipment', null, {'search': {method: 'POST'}}).search(params).$promise;
        };

        service.calculateItemWeight = function (params) {
            return $resource('/bam/wms-app/outbound/small-parcel-shipment/calculate-weight', null, {'search': {method: 'POST'}}).search(params).$promise;
        };

        service.updateSmallParcelShipment = function (params) {
            return $resource('/wms-app/small-parcel-shipment', null, {'search': {method: 'PUT'}}).search(params).$promise;
        };

        service.deleteSmallParcelShipment = function (params) {
            return $resource('/wms-app/small-parcel-shipment/tracking/batch-void', null, {'search': {method: 'PUT'}}).search(params).$promise;
        };

        return service;
    });
});