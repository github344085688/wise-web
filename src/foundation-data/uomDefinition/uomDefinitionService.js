'use strict';

define(['lodash'], function (_) {
    var uomDefinitionService = function ($resource, session) {
        var service = {};
        service.getUomDefinitionById = function (uomDefinitionId) {
            var entry = $resource("/fd-app/uom-definition/:id");
            return entry.get({id: uomDefinitionId}).$promise;
        };

        service.searchUomDefinitionsByItemId = function (param) {
            return $resource("/bam/uom-definition/by-item-spec-id", null, {
                "postQuery": {
                    method: "post",
                    isArray: true
                }
            }).postQuery(param).$promise;
        };

        service.remove = function (uomDefinitionId) {
            var entry = $resource("/fd-app/uom-definition/:id");
            return entry.delete({id: uomDefinitionId}).$promise;
        };
        service.searchUomDefinition = function (param) {
            return $resource("/bam/uom-definition/search", null, {"postQuery": {method: 'POST'}}).postQuery(param).$promise;
        };

        service.addUomDefinition = function (uomDefinition) {
            var entry = $resource("/fd-app/uom-definition");
            return entry.save(uomDefinition).$promise;
        };

        service.updateUomDefinition = function (uomDefinition) {
            var entry = $resource("/fd-app/uom-definition/:id", null, {'update': {method: 'PUT'}});
            return entry.update({id: uomDefinition.id}, uomDefinition).$promise;
        };
        return service;
    };
    uomDefinitionService.$inject = ["$resource", "session"];
    return uomDefinitionService;
});
