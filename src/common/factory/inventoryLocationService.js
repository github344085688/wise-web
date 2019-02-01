'use strict';

define([
    './factories'
], function(factories, _) {
    factories.factory('inventoryLocationService', function($resource) {
        var service = {};
        service.searchInventoryLocations = function(param) {
            return $resource("/bam/wms-app/inventory-location-qty",{}, {'search': { 'method': 'POST', isArray: true}}).search(param).$promise;
        };

        return service;
    });
});
