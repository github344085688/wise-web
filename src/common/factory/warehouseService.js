'use strict';

define([
    'angular',
    './factories'
], function(angular, factories) {
    factories.factory('warehouseService', function($q, $resource) {
        var services = {};
        
        services.getWarehouses = function() {
            return $resource('../../data/gis-warehouse1.json').query().$promise;
        };

        return services;
    });
});
