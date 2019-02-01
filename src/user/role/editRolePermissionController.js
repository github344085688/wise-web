'use strict';

define(['lodash'], function(_) {
    var ctrl = function($scope, $state,  lincUtil,
                        rolePermissionService, userRoleService,
                        permissionService, $stateParams, isAddAction) {

        $scope.pageSize = 10;
        var permissionNameMap;
        $scope.permissionSearch = {};
        $scope.saveOrUpdate = function () {
            rolePermissionService.update($scope.rolePermission.roleId, $scope.rolePermission).then(function(){
                $state.go('user.rolePermission.list');
            }, function(err){
                lincUtil.processErrorResponse(err);
            });
        };

        $scope.cancel = function(){
            $state.go('user.rolePermission.list');
        };

        $scope.togglePermission = function(permission) {
            if(!$scope.rolePermission) {
                return false;
            }
            var arr = permission.name.split("_");
            var index = $scope.rolePermission.permissionIds.indexOf(permission.id);
            if (index > -1) {
                $scope.rolePermission.permissionIds.splice(index, 1);
                var writePermissionId = permissionNameMap[arr[0] + "_write"].id;
                var writePermissionIndex = $scope.rolePermission.permissionIds.indexOf(writePermissionId);
                if(arr[1] == "read" && writePermissionIndex > -1) {
                    $scope.rolePermission.permissionIds.splice(writePermissionIndex, 1);
                }
            } else {
                $scope.rolePermission.permissionIds.push(permission.id);
                var readPermissionId = permissionNameMap[arr[0] + "_read"].id;
                var writePermissionIndex = $scope.rolePermission.permissionIds.indexOf(readPermissionId);
                if(arr[1] == "write" && writePermissionIndex < 0) {
                    $scope.rolePermission.permissionIds.push( permissionNameMap[arr[0] + "_read"].id);
                }
            }
        };

        $scope.isChecked = function(permission) {
            if(!$scope.rolePermission) {
                return false;
            }
            var index = _.findIndex($scope.rolePermission.permissionIds, function (permissionId) {
                return permission.id == permissionId;
            });
            return index > -1 ;
        };

        $scope.toggleAll = function() {
            if(!$scope.rolePermission) {
                return false;
            }
            if ($scope.selectAllIsChecked()) {
                $scope.rolePermission.permissionIds = [];
            } else {
                $scope.rolePermission.permissionIds = _.map($scope.permissions, "id");
            }
        };

        $scope.selectAllIsChecked = function () {
            if(!$scope.permissions || !$scope.rolePermission) {
                return false;
            }
            var permissionIds = $scope.rolePermission.permissionIds;
            if(permissionIds && permissionIds.length == $scope.permissions.length) {
                return true;
            } else {
                return false;
            }
        };

        $scope.onRoleSelect = function (roleId) {
            if(!$scope.isAddAction || !roleId) return;
            rolePermissionService.get(roleId).then(function (permissions) {
                if(permissions.length > 0) {
                    lincUtil.confirmPopup("Tip!", "This role already has some permissions, " +
                        "Do you want to edit this role permissions?", function () {
                        $state.go('user.rolePermission.edit', {roleId: roleId});
                    }, function () {
                        $scope.rolePermission.roleId = null;
                    });
                }
            });
        };

        $scope.loadContent = function (currentPage) {
            $scope.permissionView = $scope.permissions.slice((currentPage - 1) * $scope.pageSize,
                currentPage * $scope.pageSize > $scope.permissions.length ? $scope.permissions.length : currentPage * $scope.pageSize);
        };
        
        $scope.searchPermissions = function () {
            searchPermissions($scope.permissionSearch);
        }
        
        function getAllRoles() {
            userRoleService.queryAll().then(function(res){
                $scope.availableRoles = res;
            }, function(err){
                lincUtil.processErrorResponse(err)
            });
        };

        $scope.removePermission = function(permissionId) {
            var permission = $scope.permissionIdMap[permissionId];
            var arr = permission.name.split("_");
            var index = $scope.rolePermission.permissionIds.indexOf(permissionId);
            $scope.rolePermission.permissionIds.splice(index, 1);
            var writePermissionId = permissionNameMap[arr[0] + "_write"].id;
            var writePermissionIndex = $scope.rolePermission.permissionIds.indexOf(writePermissionId);
            if(arr[1] == "read" && writePermissionIndex > -1) {
                $scope.rolePermission.permissionIds.splice(writePermissionIndex, 1);
            }
        };
        
        function searchPermissions(param) {
            permissionService.search(param).then(function(response) {
                $scope.permissions = permissionService.sortPermissionsByName(response);
                 if(!permissionNameMap) {
                     setPermissionMap($scope.permissions);
                 }
                $scope.loadContent(1);
            });
        }
        
        function setPermissionMap(permissions) {
            permissionNameMap = {};
            $scope.permissionIdMap = {};
            permissions.forEach(function (permission) {
                permissionNameMap[permission.name] = permission;
                $scope.permissionIdMap[permission.id] = permission;
            });
        }

        function _init_(){
            getAllRoles();
            searchPermissions({});
            $scope.isAddAction = isAddAction;
            if(!isAddAction) {
                rolePermissionService.get($stateParams.roleId).then(function (permissions) {
                    $scope.rolePermission = {roleId: _.parseInt($stateParams.roleId),
                        permissionIds:  _.map(permissions, "id")};
                });
            }else {
                $scope.rolePermission = {permissionIds:[]};
            }
        }
        _init_();
    };
    ctrl.$inject = ['$scope', '$state', 'lincUtil', 'rolePermissionService','userRoleService',
        'permissionService',  '$stateParams', 'isAddAction'];
    return ctrl;
});
