'use strict';

define([
    './factories'
], function (factories, _) {
    factories.factory('titleVirtualLocationGoupService', function ($resource) {
        var service = {};

        service.search = function (param) {
            return $resource('/bam/location/title-virtual-location-group/search', null, {
                "postQuery": {
                    method: 'POST',
                    isArray: true
                }
            }).postQuery(param).$promise;
        };

        service.getById = function (id) {
            return $resource('/wms-app/location/title-virtual-location-group/' + id).get().$promise;
        };

        service.create = function (param) {
            var entry = $resource("/wms-app/location/title-virtual-location-group");
            return entry.save(param).$promise;
        };

        service.update = function (param) {
            var entry = $resource("/wms-app/location/title-virtual-location-group/:tvlgId", {tvlgId: param.id }, { 'update': { method: 'PUT' } });
            return entry.update(param).$promise;
        };

        service.deleteById = function (id) {
            return $resource('/wms-app/location/title-virtual-location-group/' + id).delete().$promise;
        };

        return service;
    });
});