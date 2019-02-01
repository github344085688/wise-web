'use strict';

define([
    './factories',
    'lodash'
], function (factories, _) {
    factories.factory('itemPropertyService', function ($resource) {
        var service = {};

        service.idToProperties = function (properties) {
            var propertyIds = [];
            _.forEach(properties, function (property) {
                if (property.propertyId) {
                    propertyIds.push(property.propertyId);
                }
            });
            service.getPropertysByIds(propertyIds).then(function (data) {
                var tempProperties = data;
                var propertiesMap = {};
                _.forEach(tempProperties, function (property) {
                    propertiesMap[property.id] = property;
                });
                _.forEach(properties, function (property) {
                    property.itemProperty = propertiesMap[property.propertyId];
                });
            });
        };

        service.getItemProperties = function (searchParam) {
            var entry = $resource('/fd-app/item-property/search', null, {
                'postQuery': {
                    method: 'POST',
                    isArray: true
                }
            });
            return entry.postQuery(searchParam).$promise;
        };

        service.getProperties = function (searchParam) {
            var entry = $resource('/bam/item-property/search', null, {
                'postQuery': {
                    method: 'POST',
                    isArray: false
                }
            });
            return entry.postQuery(searchParam).$promise;
        };

        service.getPropertyById = function (itemPropertyId) {
            return $resource('/fd-app/item-property/:id').get({
                id: itemPropertyId
            }).$promise;
        };

        service.getPropertysByIds = function (itemPropertyIds) {
            return $resource('/fd-app/item-properties', null, {
                'postQuery': {
                    method: 'POST',
                    isArray: true
                }
            }).postQuery({
                ids: itemPropertyIds
            }).$promise;
        };

        service.removeById = function (itemPropertyId) {
            return $resource("/fd-app/item-property/:id").delete({
                id: itemPropertyId
            }).$promise;
        };

        service.removeGroupById = function (itemPropertyGroupId) {
            return $resource("/fd-app/item-group/:id").delete({
                id: itemPropertyGroupId
            }).$promise;
        };

        service.getItemGroups = function (group) {
            return $resource('/fd-app/item-group/search', null, {
                'postQuery': {
                    method: 'POST',
                    isArray: true
                }
            }).postQuery(group).$promise;
        };

        service.getItemPropertyGroups = function (group) {
            return $resource('/bam/item-group/search', null, {
                'postQuery': {
                    method: 'POST',
                    isArray: false
                }
            }).postQuery(group).$promise;
        };
        
        service.searchGroupBasicInfo = function (param) {
            return $resource('/fd-app/item-group/search', null, {
                'postQuery': {
                    method: 'POST',
                    isArray: true
                }
            }).postQuery(param).$promise;
        }

        service.addItemGroup = function (itemPropertyGroup) {
            return $resource('/fd-app/item-group').save(itemPropertyGroup).$promise;
        };

        service.updateItemGroup = function (itemPropertyGroup) {
            var entry = $resource('/fd-app/item-group/:id', null, {
                "update": {
                    method: "PUT"
                }
            });
            return entry.update({
                id: itemPropertyGroup.id
            }, itemPropertyGroup).$promise;
        };

        service.getItemPropertyGroupById = function (itemPropertyGroupId) {
            return $resource('/fd-app/item-group/:id').get({
                id: itemPropertyGroupId
            }).$promise;
        };

        service.getItemPropertiesByGroupId = function (itemPropertyGroupId) {
            return $resource('/fd-app/item-group/:id/properties').query({
                id: itemPropertyGroupId
            }).$promise;
        };

        service.addItemProperty = function (itemProperty) {
            var entry = $resource("/fd-app/item-property");
            return entry.save(itemProperty).$promise;
        };

        service.updateItemProperty = function (itemProperty) {
            var entry = $resource("/fd-app/item-property/:id", null, {
                "update": {
                    method: "PUT"
                }
            });
            return entry.update({
                id: itemProperty.id
            }, itemProperty).$promise;
        };
        
        return service;
    });
});