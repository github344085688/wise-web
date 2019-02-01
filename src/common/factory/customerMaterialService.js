'use strict';

define([
  './factories'
], function (factories) {

  factories.factory('customerMaterialService', function ($q, $resource) {
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

    //CustomerMaterialWebService
    service.getCustomerMaterial = function (id) {
      return $resource('/fd-app/customer-material-config/:id').get({ id: id }).$promise;
    }

    service.searchCustomerMaterial = function (params) {
      return $resource("/bam/fd-app/customer-material-config/search", null, resourceConfig).search(params).$promise;
    };

    service.updateCustomerMaterial = function (customerMaterial) {
      return $resource("/fd-app/customer-material-config/:id", { id: customerMaterial.id }, resourceConfig).update(customerMaterial).$promise;
    };

    service.createCustomerMaterial = function (customerMaterial) {
      return $resource("/fd-app/customer-material-config", {}, resourceConfig).save(customerMaterial).$promise;
    };

    service.deleteCustomerMaterial = function (id) {
      return $resource("/fd-app/customer-material-config/:id", { id: id }).delete().$promise;
    };

    //AutoGenerationCustomerMaterial
    service.getAutoGenerationCustomerMaterial = function (id) {
      return $resource('/wms-app/auto-generation-customer-material/:id').get({ id: id }).$promise;
    }

    service.searchAutoGenerationCustomerMaterial = function (params) {
      return $resource("/wms-app/auto-generation-customer-material/search", null, resourceConfig).search(params).$promise;
    };

    service.searchByPagingAutoGenerationCustomerMaterial = function (params) {
      return $resource("/bam/wms-app/auto-generation-customer-material/search-by-paging", null, {
        'search': {
          method: 'POST'
        }
      }).search(params).$promise;
    };

    service.updateAutoGenerationCustomerMaterial = function (AutoGenerationMaterialUpdate) {
      return $resource("/wms-app/auto-generation-customer-material/:id", { id: AutoGenerationMaterialUpdate.id }, resourceConfig).update(AutoGenerationMaterialUpdate).$promise;
    };

    service.createAutoGenerationCustomerMaterial = function (AutoGenerationMaterialCreate) {
      return $resource("/wms-app/auto-generation-customer-material", {}, resourceConfig).save(AutoGenerationMaterialCreate).$promise;
    };

    service.deleteAutoGenerationCustomerMaterial = function (id) {
      return $resource("/wms-app/auto-generation-customer-material/:id", { id: id }).delete().$promise;
    };

    service.approveAutoGenerationCustomerMaterial = function (id) {
      return $resource("/wms-app/auto-generation-customer-material/approve/:id", { id: id }, resourceConfig).update().$promise;
    };

    service.ignoreAutoGenerationCustomerMaterial = function (id) {
      return $resource("/wms-app/auto-generation-customer-material/ignore/:id", { id: id }, resourceConfig).update().$promise;
    };

    return service;
  });
});
