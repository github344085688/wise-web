'use strict';

define([
    './factories'
], function (factories, _) {
    factories.factory('locationItemService', function ($resource) {
        var service = {};

        service.getLocationItem = function (id) {
            return $resource('/location-item/:id').get({ id:id }).$promise;
        };

        service.searchLocationItem = function (param) {
            var entry = $resource("/report-center/location-item/search-by-paging", null, { 'postQuery': { method: 'POST'} });
            return entry.postQuery(param).$promise;
        };

        service.addLocationItem = function (locationItem) {
            var entry = $resource("/wms-app/location-item");
            return entry.save(locationItem).$promise;
        };

        service.updateLocationItem = function (locationItem) {
            var entry = $resource("/wms-app/location-item/:id", {id: locationItem.id}, { 'update': { method: 'PUT' } });
            return entry.update(locationItem).$promise;
        };

        service.deleteLocationItem = function (locationItemId) {
            return $resource('/wms-app/location-item/' + locationItemId).delete().$promise;
        };
        return service;
    });
});