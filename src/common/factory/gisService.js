'use strict';

define([
    './factories'
], function(factories, _) {
    factories.factory('gisService', function($resource) {
        var service = {};
        
        //equipemnt type
        service.saveEquipmentType = function(param){
        	return $resource('/fd-app/gis/equipment-type').save(param).$promise;
        };
        service.updateEquipmentType = function(id, param){
        	return $resource('/fd-app/gis/equipment-type/:id', null, {'update': {method: 'PUT'}}).update({id: id}, param).$promise;
        };
        service.removeEquipmentType = function(id){
        	return $resource('/fd-app/gis/equipment-type/:id').remove({id: id}).$promise;
        };
        service.getEquipmentType = function() {
            return $resource('/fd-app/gis/equipment-type').query().$promise;
        };

        return service;
    });
});
