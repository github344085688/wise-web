'use strict';

define([
    './factories',
    'angular'
], function(factories, angular) {
    factories.factory('materialLineService', function($resource) {
        var resourceConfig = {
            'update': {
                method: 'PUT'
            },
            'search': {
                method: 'POST',
                isArray: true
            }
        }

        var service = {};
        service.searchMaterialLine = function(param) {
            return $resource("/bam/material-line/search",{}, resourceConfig).search(param).$promise;
        };

        service.createMaterialLine = function(materialLine) {
            return $resource("/wms-app/material-line").save(materialLine).$promise;
        };

        service.updateMaterialLine = function(materialLineId, materialLine) {
            return $resource("/wms-app/material-line/" + materialLineId,
                {}, resourceConfig).update(materialLine).$promise;
        };

        service.deleteMaterialLine = function(materialLineId) {
            return $resource("/wms-app/material-line/" + materialLineId).delete().$promise;
        };

        service.getMaterialLine = function(materialLineId) {
            return $resource("/wms-app/material-line/" + materialLineId).get().$promise;
        };

        return service;
    });
});
