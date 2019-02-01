'use strict';

define([
    './factories',
    'lodash',
    'angular'
], function (factories, _, angular) {

    factories.factory('organizationAkaService', function ($q, $resource) {
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

        service.getAkaByOrganizationId = function (orgId) {
            return $resource('/fd-app/organization/aka/:orgId').get({
                orgId: orgId
            }).$promise;
        };

        service.searchAka = function (params) {
            return $resource("/fd-app/organization/aka/search", null, resourceConfig).search(params).$promise;
        };

        service.updateAka = function (aka) {
            return $resource("/fd-app/organization/aka/:orgId", {orgId: aka.orgId}, resourceConfig).update(aka).$promise;
        };

        service.createAka = function (aka) {
            return $resource("/fd-app/organization/aka", {}, resourceConfig).save(aka).$promise;
        };

        service.deleteAka = function (orgId) {
            return $resource("/fd-app/organization/aka/:orgId", {orgId: orgId}).delete().$promise;
        };

        return service;
    });
});
