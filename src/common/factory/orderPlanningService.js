'use strict';

define([
    './factories'
], function(factories, _) {
    factories.factory('orderPlanningService', function($resource) {
        var service = {};

        service.getCustomerFilters = function(param) {
            return $resource('/bam/outbound/pick/order-planning/customer-filter'
              ).query().$promise;
        };

        service.getLocationFilters = function(param) {
            return $resource('/bam/outbound/pick/order-planning/location-filter'
            ).query().$promise;
        };

        service.getItemFilters = function(param) {
            return $resource('/bam/outbound/pick/order-planning/item-summary-filter'
            ).query().$promise;
        };

        service.orderPlanningSearch = function(param) {
            return $resource('/bam/outbound/pick/order-planning/item-summary-filter', null, { 'search': {
                method: 'POST',
                isArray: true
            }}).search(param).$promise;
        };

        service.makeOrderPlanning = function (orderIds) {
            return $resource('/wms-app/outbound/pick/order-planning', null, { 'put': {
                method: 'PUT'
            }}).put({cleanPlanningError: true, async: false, orderIds: orderIds}).$promise;
        };

        return service;
    });
});