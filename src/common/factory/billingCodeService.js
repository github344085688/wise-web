'use strict';

define([
    './factories'
], function(factories, _) {
    factories.factory('billingCodeService', function($q, $resource) {
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

        services.searchBillingCode = function(param) {
            return $resource('/bam/billing-code/search', null, {
                'postSearch': {
                    method: 'POST',
                    isArray: true
                }
            }).postSearch(param).$promise;
        };

        services.getBillingCodeById = function(codeId){
            return $resource("/fd-app/billing-code/:id",
                {id: codeId}).get().$promise;
        };

        services.updateBillingCode = function(code){
            return $resource("/fd-app/billing-code/:id",
                {id: code.id}, resourceConfig).update(code).$promise;
        };

        services.createBillingCode = function(code){
            return $resource("/fd-app/billing-code",
                {}, resourceConfig).save(code).$promise;
        };

        services.disableBillingCode = function(codeId){
            return $resource("/fd-app/billing-code/disable/:id",
                {id: codeId}, resourceConfig).update(codeId).$promise;
        };

        services.enableBillingCode = function(codeId){
            return $resource("/fd-app/billing-code/enable/:id",
                {id: codeId}, resourceConfig).update(codeId).$promise;
        };

        services.deleteBillingCode = function(codeId){
            return $resource("/fd-app/billing-code/:id",
                {id: codeId}).delete().$promise;
        };

        return services;
    });


});
