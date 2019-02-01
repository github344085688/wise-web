'use strict';

define([
    'lodash',
    './factories'
], function(_, factories) {
    factories.factory('permissionService', function($resource) {
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

        services.queryAll = function() {
            return $resource('/idm-app/permission/all').query().$promise;
        };
        services.search = function(param) {
            return $resource('/idm-app/permission/search',{}, resourceConfig).search(param).$promise;
        };

        services.save = function(permission) {
            return $resource("/idm-app/permission").save(permission).$promise;
        };

        services.update = function(rolePermission) {
            return $resource("../../data/permission.json").save().$promise;
        };

        services.remove = function(permissionId) {
            return $resource("/idm-app/permission/:permissionId").delete({permissionId:permissionId}).$promise;
        };

        services.sortPermissionsByName = function (objs) {
            var groupNamesByHeadKeys = _.groupBy(objs, function (permission) {
                var arr = permission.name.split("::");
                if(arr.length == 1) {
                    var arr1 = arr[0].split("_");
                    return " |" + arr1[0];
                }
                if(arr.length == 2) {
                    var arr1 = arr[1].split("_");
                    return arr[0] + " |" + arr1[0];
                }
            });
            var permissions = _.flattenDepth(_.values(groupNamesByHeadKeys), 1);
            return permissions;
        };

        return services;
    });


});