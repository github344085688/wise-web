'use strict';

define([
    './factories'
], function(factories, _) {
    factories.factory('locationTypeService', function($resource) {
        var service = {};

        service.getLocationTypes = function() {
            return $resource('../../data/locationTypes.json').query().$promise;
        };


        return service;
    });
});
