'use strict';

define([
    './factories',
], function(factories) {
    factories.factory('itemLpTemplateMappingService', function($resource) {
        var resourceConfig = {
            'update': {
                method: 'PUT'
            },
            'search': {
                method: 'POST',
                isArray: true
            }
        };
        var service = {};
        service.search = function(param) {
            return $resource("/bam/item-lp-template-mapping/search",{}, resourceConfig).search(param).$promise;
        };

        service.create = function(mapping) {
            return $resource("/fd-app/item-lp-template-mapping", null, {"create": { method: 'POST'}}).create(mapping).$promise;
        };

        service.updateById = function (id, param) {
            return $resource("/fd-app/item-lp-template-mapping/:id", null, { "update": { method: 'PUT' } }).update({ id: id }, param).$promise;
        };

        service.deleteById = function (id) {
            return $resource("/fd-app/item-lp-template-mapping/:id").delete({ id: id }).$promise;
        };

        service.getById= function(id) {
            return $resource("/fd-app/item-lp-template-mapping/:id", {id: id}).get().$promise;
        };

        return service;
    });
});
