'use strict';

define([
    './factories',
    'lodash',
    'angular'
], function (factories, _, angular) {

    factories.factory('organizationService', function ($q, $resource, customerService,
                                                       organizationRelationshipService) {
        var resourceConfig = {
            'update': {
                method: 'PUT'
            },
            'search': {
                method: 'POST',
                isArray: true
            }
        };

        var notMaintainByRelationshipTags = ["Facility", "Company", "Carrier"];
        var tagUrlMap = {Facility: "/fd-app/facility/search",
            Company: "/fd-app/company/search",
            Carrier: "/bam/carrier/search-around-customerId"
        };

        var service = {};

        service.getOrganizationById = function (id) {
            return $resource('/fd-app/organization/:id').get({
                id: id
            }).$promise;
        };

        service.searchOrganization = function (params) {
            return $resource("/fd-app/organization/search", null, resourceConfig).search(params).$promise;
        };

        service.updateOrganization = function (organization) {
            return $resource("/fd-app/organization/:id", {id: organization.basic.id}, resourceConfig).update(organization).$promise;
        };

        service.createOrganization = function (organization) {
            return $resource("/fd-app/organization", {}, resourceConfig).save(organization).$promise;
        };

        service.getOrganizationByTag = function (params) {
            if(notMaintainByRelationshipTags.indexOf(params.relationship) > -1 ) {
                return $resource(tagUrlMap[params.relationship], {}, resourceConfig).search(params).$promise;
            } else {
                return $resource("/bam/organization/search-by-relationship", {}, resourceConfig).search(params).$promise;
            }
        };

        service.getOrganizations = function (params) {
             var entry = $resource("/fd-app/organization/search", null, {
                     'postSearch': {
                      method: 'POST',
                        isArray: true
                    }
                 });
             return entry.postSearch(params).$promise;
        };

        service.getCarrierByOrganizationId = function (orgId) {
            return $resource('/fd-app/carrier/:id').get({id: orgId}).$promise;
        };

        service.getOrganizationByTagAndCustomerId = function (searchParam) {
            if(searchParam.relationship) {
                if(notMaintainByRelationshipTags.indexOf(searchParam.relationship) > -1) {
                     return $resource(tagUrlMap[searchParam.relationship], {}, resourceConfig).search(searchParam).$promise;
                } else {
                    return $resource("/bam/organization/search-around-customerId", {}, resourceConfig).search(searchParam).$promise;
                }
            } else {
                return service.getOrganizations(searchParam);
            }
        };

        service.getOrganizationAndRoles = function (orgnizationId, partnerId) {
            return $resource("/bam/organization/get-organization-and-roles/:organizationId/:partnerId",
                {organizationId:orgnizationId, partnerId:partnerId}).get().$promise;
        };

        service.deleteOrganization = function (id) {
            return $resource("/fd-app/organization/:id",{id:id}).delete().$promise;
        };

        service.deleteOrganizationAllRelationships = function (organizationId, partnerId, cbFun) {
            var promises = [];
            organizationRelationshipService.getRelationshipTags(organizationId, partnerId).then(function (roles) {
                roles.forEach(function (role) {
                    promises.push(organizationRelationshipService.deleteRelationshipRole(organizationId, partnerId, role));
                });
                promises.push(service.deleteOrganization(partnerId));
                if(roles.indexOf("Customer") > -1) {
                    promises.push(customerService.deleteCustomer(organizationId));
                }
                cbFun($q.all(promises));
            });
        };

        service.organizationImport = function (params) {
            var entry = $resource("/fd-app/organization-import", null, {
                'import': {
                    method: 'POST'
                }
            });
            return entry.import(params).$promise;
        };
        
        return service;
    });
});
