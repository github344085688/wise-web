'use strict';

define([
    './factories'
], function(factories, _) {
    factories.factory('inventoryCommitmentService', function($resource) {
       
        var service = {};
        service.buildCommitment = function(orders) {
            return $resource("/bam/outbound/inventory-commitment",null, { 'buildCommitment': {
                method: 'POST',
                isArray: true
            }}).buildCommitment(orders).$promise;
        };
        
        service.commitmentReport = function(searchParam) {
            return $resource("/bam/outbound/inventory-commitment-report",null, { 'search': {
                method: 'POST'
            }}).search(searchParam).$promise;
        };

        service.commitmentRollback = function (orders) {
            return $resource("/bam/outbound/inventory-commitment-rollback",null, { 'commitmentRollback': {
                method: 'POST',
                isArray: false
            }}).commitmentRollback(orders).$promise;
        };

        service.commitmentCheckExpirationdate = function(orderIds) {
            return $resource("/bam/outbound/inventory-commitment/check-expirationdate",null, { 'search': {
                method: 'POST'
            }}).search({orderIds:orderIds}).$promise;
        };

        return service;
    });
});
