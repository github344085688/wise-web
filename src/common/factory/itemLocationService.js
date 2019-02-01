'use strict';

define([
    './factories'
], function (factories, _) {
    factories.factory('itemLocationService', function ($resource) {
        var service = {};

        service.getItemLocationByIdFromBam = function (id) {
            return $resource('/bam/item-location/:id').get({ id:id }).$promise;
        };

        service.searchItemLocation = function (param) {
            var entry = $resource("/bam/item-location/search", null, { 'postQuery': { method: 'POST'} });
            return entry.postQuery(param).$promise;
        };

        service.addItemLocation = function (itemLocation) {
            var entry = $resource("/wms-app/item-location");
            return entry.save(itemLocation).$promise;
        };

        service.updateItemLocation = function (itemLocation) {
            var entry = $resource("/wms-app/item-location/:id", {id: itemLocation.id}, { 'update': { method: 'PUT' } });
            return entry.update(itemLocation).$promise;
        };


        service.deleteItemLocation = function (itemLocationId) {
            return $resource('/wms-app/item-location/' + itemLocationId).delete().$promise;
        };
        return service;
    });
});