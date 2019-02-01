'use strict';

define([
    './factories'
], function (factories) {
    factories.factory('facilityService', function ($q, $resource) {
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

        service.getFacilityByOrgId = function (orgId) {
            return $resource('/fd-app/facility/:id').get({
                id: orgId
            }).$promise;
        };

        service.searchFacility = function (params) {
            return $resource("/fd-app/facility/search", null, resourceConfig).search(params).$promise;
        };

        service.createAndUpdateFacility = function (orgId, facility) {
            return $resource("/fd-app/facility/:id", {id: orgId}, resourceConfig).update(facility).$promise;
        };

        service.deleteFacility = function (orgId) {
            return $resource("/fd-app/facility/:id", {id: orgId}).delete().$promise;
        };

        service.getActivatedFacility = function (orgId) {
            return $resource('/bam/fd-app/facility/:orgId/active-customers').get({
                orgId: orgId
            }).$promise;
        };

        return service;
    });
});
