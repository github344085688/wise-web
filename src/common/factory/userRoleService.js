'use strict';

define([
    './factories'
], function(factories, _) {
    factories.factory('userRoleService', function($resource) {

        var service = {};

        service.queryAll = function() {
            return $resource('/idm-app/role/all').query().$promise;
        };

        service.remove = function(roleId) {
            return $resource("/idm-app/role/:roleId").delete({ roleId: roleId }).$promise;
        };

        service.add = function(role) {
            return $resource('/idm-app/role').save(role).$promise;
        };


        return service;
    });
});
