'use strict';

define([
    './factories'
], function (factories) {

    factories.factory('companyService', function ($q, $resource) {
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

        service.getCompanyByOrgId = function (orgId) {
            return $resource('/fd-app/company/:id').get({
                id: orgId
            }).$promise;
        };

        service.searchCompany = function (params) {
            return $resource("/fd-app/company/search", null, resourceConfig).search(params).$promise;
        };

        service.createAndUpdateCompany = function (orgId, company) {
            return $resource("/fd-app/company/:id", {id: orgId}, resourceConfig).update(company).$promise;
        };

        service.deleteCompany = function (orgId) {
            return $resource("/fd-app/company/:id", {id: orgId}).delete().$promise;
        };

        return service;
    });
});
