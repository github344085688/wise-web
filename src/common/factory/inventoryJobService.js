'use strict';

define([
    './factories', 'lodash'
], function(factories, _) {
    factories.factory('inventoryJobService', function($q, $resource) {
        var services = {};
        services.createJob = function(job)
        {
            return $resource('/iinventory-app/inventory-job').save(job).$promise;
        };

        services.updateJob = function(jobId, job) {
             return $resource('/wms-app/inventory-job/:jobId', {jobId: jobId}, {'update': {
                 method: 'PUT'
             }}).update(job).$promise;
        };

        services.getJob = function(jobId) {
            return $resource('/wms-app/inventory-job/:jobId', {jobId: jobId}).get().$promise;
        };

        return services;
    });
});

