'use strict';

define([
    './factories'
], function(factories, _) {
    factories.factory('uomPickTypeService', function($q, $resource) {
        var resourceConfig = {
            'update': {
                method: 'PUT'
            },
            'search': {
                method: 'POST',
                isArray: true
            }
        };
        var services = {};

        services.searchUomPickType = function(param) {
            return $resource('/bam/item-unit-pick-type/search', null, {
                'postSearch': {
                    method: 'POST',
                    isArray: true
                }
            }).postSearch(param).$promise;
        };

        services.getUomPickTypeById = function(id){
            return $resource("/fd-app/item-unit-pick-type/get/:id",
                {id: id}).get().$promise;
        };

        services.updateUomPickType = function(uomPickType){
            return $resource("/fd-app/item-unit-pick-type/update/:id",
                {id: uomPickType.id}, resourceConfig).update(uomPickType).$promise;
        };

        services.createUomPickType = function(uomPickType){
            return $resource("/fd-app/item-unit-pick-type/create",
                {}, resourceConfig).save(uomPickType).$promise;
        };

        services.deleteUomPickType = function(uomPickTypeId){
            return $resource("/fd-app/item-unit-pick-type/delete/:id",
                {id: uomPickTypeId}).delete().$promise;
        };

        return services;
    });


});
