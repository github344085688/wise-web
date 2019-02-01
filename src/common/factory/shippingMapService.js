'use strict';

define([
  './factories'
], function (factories) {

  factories.factory('shippingMapService', function ($q, $resource) {
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

    service.getShippingMapConfig = function (id) {
      return $resource('/fd-app/shipping-map-config/:id').get({ id: id }).$promise;
    }

    service.searchShippingMapConfig = function (params) {
      return $resource("/bam/fd-app/shipping-map-config/search", null, resourceConfig).search(params).$promise;
    };

    service.updateShippingMapConfig = function (shippingMap) {
      return $resource("/fd-app/shipping-map-config/:id", { id: shippingMap.id }, resourceConfig).update(shippingMap).$promise;
    };

    service.createShippingMapConfig = function (shippingMap) {
      return $resource("/fd-app/shipping-map-config", {}, resourceConfig).save(shippingMap).$promise;
    };

    service.deleteShippingMapConfig = function (id) {
      return $resource("/fd-app/shipping-map-config/:id", { id: id }).delete().$promise;
    };


    return service;
  });
});
