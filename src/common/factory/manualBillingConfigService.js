'use strict';

define([
  './factories'
], function (factories) {

  factories.factory('manualBillingConfigService', function ($q, $resource) {
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

    //CustomerManualBillingConfig
    service.getManualBillingConfig = function (id) {
      return $resource('/fd-app/manual-billing-config/:id').get({ id: id }).$promise;
    }

    // service.searchCustomerMaterial = function (params) {
    //   return $resource("/bam/fd-app/customer-material-config/search", null, resourceConfig).search(params).$promise;
    // };

    service.searchManualBillingConfig = function (params) {
      return $resource("/fd-app/manual-billing-config/search", null, resourceConfig).search(params).$promise;
    };

    service.updateManualBillingConfig = function (manualBilling) {
      return $resource("/fd-app/manual-billing-config/:id", { id: manualBilling.id }, resourceConfig).update(manualBilling).$promise;
    };

    service.createManualBillingConfig = function (manualBilling) {
      return $resource("/fd-app/manual-billing-config", {}, resourceConfig).save(manualBilling).$promise;
    };

    service.deleteCustomerMaterial = function (id) {
      return $resource("/fd-app/manual-billing-config/:id", { id: id }).delete().$promise;
    };

    service.getAccountItems = function (params) {
      return $resource("/report-center/billing/get-account-items", null, resourceConfig).search(params).$promise;
    };

    //
    
    return service;
  });
});
