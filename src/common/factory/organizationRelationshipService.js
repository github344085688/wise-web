'use strict';

define([
    './factories'
], function (factories) {

    factories.factory('organizationRelationshipService', function ($q, $resource) {
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
        service.getRelationshipById = function (id) {
            return $resource("/fd-app/organization-relationship/:id", {id: id}).$promise;
        };

        service.searchRelationship = function (params) {
            return $resource("/fd-app/organization-relationship/search", null, resourceConfig).search(params).$promise;
        };

        service.relationshipSearchByPaging = function (params) {
            return $resource("/bam/organization-relationship/search-by-paging", null,{
                'search': {
                    method: 'POST'
                }
            }).search(params).$promise;
        };

        service.createRelationship = function (relationship) {
            return $resource("/fd-app/organization-relationship", {}, resourceConfig).save(relationship).$promise;
        };

        service.updateRelationship = function (id, relationship) {
            return resource("/fd-app/organization-relationship/:id",
                {id: id}, resourceConfig).update(relationship).$promise;
        };

        service.deleteRelationship = function (id) {
            return $resource("/fd-app/organization-relationship/:id", {id: id}).delete().$promise;
        };

        service.deleteRelationshipRole = function (organizationId, partnerId, role) {
            var entry = $resource("/fd-app/organization-relationship-role/:organizationId/:partnerId/:role");
            return entry.delete({
                organizationId: organizationId,
                partnerId: partnerId,
                role: role
            }).$promise;
        };

        service.getRelationshipTags = function (organizationId, partnerId) {
            return $resource("/fd-app/organization-relationship/get-relationship-tags/:organizationId/:partnerId",
                {organizationId: organizationId, partnerId:partnerId}, { 'get': {
                    isArray: true
                }}) .get().$promise;
        };
        

        service.inactiveOrganizationCustomer = function (id) {
            var url = linc.config.contextPath + "/shared/bam/customer/:customerId/inactive";
            var entry = $resource(url, {customerId:id} , { 'update': { method: 'PUT' } });
            return entry.update().$promise;
        };

        return service;
    });
});
