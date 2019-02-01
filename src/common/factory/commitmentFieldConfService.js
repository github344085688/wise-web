'use strict';

define([
    './factories',
    'lodash'
], function(factories, _) {
    factories.factory('commitmentFieldConfService', function($resource) {
        var service = {};

        service.getConfigByCustomerId = function(id) {
            return $resource("/fd-app/commitInventory/:id").get({ id: id }).$promise;
        };

        service.saveConfiguration = function(config) {
            return $resource("/fd-app/commitInventory/:id", null, { 'replace': { method: 'PUT' } }).replace({ id: config.id }, config).$promise;
        };

        return service;
    });
});
