'use strict';

define([
    './factories',
    "lodash",
    'src/module-config'
], function(factories, _, moduleConfig) {
    factories.factory('permissionCheckService', ['permissionService' , function(permissionService) {

        var service = {}, _module_permission_map = {};
        var _permissionMapByStateName = {};
        

        moduleConfig.forEach(function(mf){
            if(mf.permissions) {
                _module_permission_map[mf.name] = _.split(mf.permissions, ",");
            }
        });
        
        service.judgeIfHasPermission = function(requiredPermissions, userPermissions) {
            if(linc.config.isPermissionDisabled || !requiredPermissions) {
                return true;
            }
            if (!userPermissions) {
                return true;
            }
            var permissions =  _.split(requiredPermissions, ",");
            requiredPermissions = _.map(permissions, _.trim);
           
            if( requiredPermissions.length == 0) {
                return true;
            }else if(_.difference(userPermissions, requiredPermissions).length >= userPermissions.length) {
                return false;
            }else {
                return true;
            }
        }
        
        function createPermissions(permissionMapByStateName) {
            var permissions = _.uniq(_.flattenDepth(_.values(permissionMapByStateName), 1));
            var arr = ["outbound::packOrder_write", "task::generalTask_write", "task::pluginStep_write",
            "user::permission_write", "user::tag_write", "user::role_write", "user::rolePermission_write",
            "user::userManagement_write", "service::print_write", "config::inventory_write", "config::pick_write",
            "facility::appointmentSet_write", "facility::checkinWaiting_write", "item::itemSpec_write",
             "uomDefinition_write", "pending_write", "organization_write", "uomDefinition_write"]
            permissions = _.union(permissions, arr);
     
            permissions.forEach(function (permission, key) {
                permissionService.save({name: permission, category: "WEB"}).then(function () {
                    console.log("success!-----" + key);
                }, function () {
                    console.log("fail!-----" + key);
                });
            });
        }
        
        service.generatePermissionsByStateName = function (appStates) {
            var object = {};
            _.forEach(appStates, function (state) {
                var stateName = state.name;
                if(!stateName)  return;
                if(state.data && state.data.permissions) {
                    var permissions = _.split(state.data.permissions, ",");
                    permissions = _.map(permissions, _.trim);
                    setStatePermission(stateName, permissions, object);
                }
            });
            _permissionMapByStateName = object;
            // createPermissions(_permissionMapByStateName);
        }
        
        function setStatePermission(stateName, permissions, object) {
            if(!object[stateName]) {
                object[stateName] = permissions;
            }else {
                object[stateName] = _.union(permissions, object[stateName]);
            }
        }
        return service;
    }]);
});
