'use strict';

define([
    './factories'
], function(factories) {
    factories.factory('rolePermissionService', function($resource) {
        var services = {};

        var resourceConfig = {
            'update': {
                method: 'PUT'
            },
            'search': {
                method: 'POST',
                isArray: true
            }
        };
        
        services.search = function(param) {
            return $resource('/bam/user/role-permission/all').query().$promise;
        };

        services.queryAll = function() {
            return $resource('/bam/user/role-permission/all').query().$promise;
        };


        services.update = function(roleId, rolePermission) {
            return $resource('/idm-app/role/:roleId/permission', {roleId:rolePermission.roleId}, resourceConfig).update(rolePermission).$promise;
        };

        services.get = function(roleId) {
            return $resource("/idm-app/role/:roleId/permission").query({roleId:roleId}).$promise;
        };

        return services;
    });


});