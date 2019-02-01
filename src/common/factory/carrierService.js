'use strict';

define([
    './factories'
], function (factories) {

    factories.factory('carrierService', function ($q, $resource) {
        var resourceConfig = {
            'update': {
                method: 'PUT'
            },
            'search': {
                method: 'POST',
                isArray: true
            },
            'searchByPaging': {
                method: 'POST'
            }
        };
        var service = {};

        service.getCarrierByOrgId = function (orgId) {
            return $resource('/fd-app/carrier/:id').get({
                id: orgId
            }).$promise;
        };

        service.searchCarrier = function (params) {
            return $resource("/fd-app/carrier/search", null, resourceConfig).search(params).$promise;
        };

        service.searchCarrierByPaging = function (params) {
            return $resource("/fd-app/carrier/search-by-paging", null, resourceConfig).searchByPaging(params).$promise;
        };


        service.createAndUpdateCarrier = function (orgId, carrier) {
            return $resource("/fd-app/carrier/:id", {id: orgId}, resourceConfig).update(carrier).$promise;
        };

        service.deleteCarrier = function (orgId) {
            return $resource("/fd-app/carrier/:id", {id: orgId}).delete().$promise;
        };

        return service;
    });
});
