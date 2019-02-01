'use strict';

define([
  './factories'
], function (factories) {

  factories.factory('facilityEquipmentService', function ($q, $resource) {
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

    service.getFacilityEquipment = function (id) {
      return $resource('/base-app/facility-equipment/:id').get({ id: id }).$promise;
    }

    service.searchFacilityEquipment = function (params) {
      return $resource("/base-app/facility-equipment/search", null, resourceConfig).search(params).$promise;
    };

    service.updateFacilityEquipment = function (facilityEquipment) {
      return $resource("/base-app/facility-equipment/:id", { id: facilityEquipment.id }, resourceConfig).update(facilityEquipment).$promise;
    };

    service.createFacilityEquipment = function (facilityEquipment) {
      return $resource("/bam/facility/equipment/facility-equipment", {}, resourceConfig).save(facilityEquipment).$promise;
    };

    service.deleteFacilityEquipment = function (id) {
      return $resource("/base-app/facility-equipment/:id", { id: id }).delete().$promise;
    };
    
    return service;
  });
});
