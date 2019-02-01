'use strict';

define([
  './factories'
], function (factories) {

  factories.factory('customerTemplateService', function ($q, $resource) {
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

    service.getCustomerTemplate = function (id) {
      return $resource('/fd-app/customer-template/:id').get({ id: id }).$promise;
    }

    service.searchCustomerTemplate = function (params) {
      return $resource("/fd-app/customer-template/search", null, resourceConfig).search(params).$promise;
    };

    service.createCustomerTemplate = function (CustomerTemplateCreate) {
      return $resource("/fd-app/customer-template", {}, resourceConfig).save(CustomerTemplateCreate).$promise;
    };

    service.deleteCustomerTemplate = function (id) {
      return $resource("/fd-app/customer-template/:id", { id: id }).delete().$promise;
    };


    return service;
  });
});
