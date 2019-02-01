'use strict';

define([
    './factories'
], function(factories, _) {
    factories.factory('diverseUnitService', function($resource) {

        var service = {};

        service.searchDiverseUnit = function(param) {
            return $resource("/bam/item-spec/search-diverse-unit", null, { "postQuery": { method: 'POST'} }).postQuery(param).$promise;
        };

        service.addDiverseUnit = function(diverseUnit) {
            return $resource("/fd-app/diverse-unit").save(diverseUnit).$promise;
        };

        service.updateDiverseUnit = function(diverseUnit) {
            return $resource("/fd-app/diverse-unit/:id",{id: diverseUnit.id }, { "update": { method: 'PUT'}}).update(diverseUnit).$promise;
        };

        service.removeDiverseUnit = function(id) {
            return $resource("/fd-app/diverse-unit/:id").delete({ id: id }).$promise;
        };


        return service;
    });
});
