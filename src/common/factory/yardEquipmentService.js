'use strict';

define([
    './factories'
], function(factories, _) {
    factories.factory('yardEquipmentService', function($resource) {
        var service = {};
        service.getLocationOccupy = function () {
            return $resource('/report-center/yard-equipment/location-occupy').query().$promise;
        };

        return service;
    });
});
