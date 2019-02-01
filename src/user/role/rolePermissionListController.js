'use strict';

define(['lodash',
    'angular'
], function (_, angular) {
    var ctrl = function ($scope, $state, $q, lincUtil, userRoleService, permissionService, rolePermissionService) {
        $scope.pageSize = 8;
        $scope.searchCompleted = true;
        $scope.permissionsMapByCommonName = {};
        $scope.currentRolePermission;
        var permissionNameMap = {};
        var groupPermissions = {};
        var rolePermissionIds = {};
        var initRolePermissionIds;

        $scope.getPermissionByType = function (permissions, type) {
            var obj = null;
            _.forEach(permissions, function (permission) {
                if (permission.name.indexOf(type) > -1) {
                    obj = permission;
                }
            });
            return obj;
        };

        $scope.editRolePermission = function (roleId) {
            $scope.currentRolePermissionLoading = true;
            rolePermissionService.get(roleId).then(function (rolePermissions) {
                $scope.currentRolePermissionLoading = false;
                $scope.currentRolePermission = { roleId: _.parseInt(roleId) };
                initSetAllRolePermissions(rolePermissions);
            }, function (err) {
                $scope.currentRolePermissionLoading = false;
                lincUtil.processErrorResponse(err);
            });
        };

        function initSetAllRolePermissions(rolePermissions) {
            rolePermissionIds = {};
            var rolePermissions = _.sortBy(rolePermissions, 'name');
           // var rolePermissions = permissionService.sortPermissionsByName(rolePermissions);
            var roleGroupPermissions = _.groupBy(rolePermissions, 'groupName');
            rolePermissionIds["Other"] = _.map(roleGroupPermissions["Other"], "id");
            rolePermissionIds["Foundation Data"] = _.map(roleGroupPermissions["Foundation Data"], "id");
            initRolePermissionIds = angular.copy(rolePermissionIds);
        }

        $scope.togglePermission = function (permission, group) {
            var arr = permission.name.split("_");
            var index = rolePermissionIds[group].indexOf(permission.id);
            if (index > -1) {
                rolePermissionIds[group].splice(index, 1);
                var writePermissionId = permissionNameMap[arr[0] + "_write"].id;
                var writePermissionIndex = rolePermissionIds[group].indexOf(writePermissionId);
                if (arr[1] == "read" && writePermissionIndex > -1) {
                    rolePermissionIds[group].splice(writePermissionIndex, 1);
                }
            } else {
                rolePermissionIds[group].push(permission.id);
                var permissionRead = permissionNameMap[arr[0] + "_read"];
                if(permissionRead) {
                    var readPermissionId = permissionRead.id;
                    var writePermissionIndex = rolePermissionIds[group].indexOf(readPermissionId);
                    if (arr[1] == "write" && writePermissionIndex < 0) {
                        rolePermissionIds[group].push(readPermissionId);
                    }
                }
            }
        };

        $scope.isChecked = function (permission, group) {
            if (!permission || !$scope.currentRolePermission) {
                return false;
            }
            var index = _.findIndex(rolePermissionIds[group], function (permissionId) {
                return permission.id == permissionId;
            });
            return index > -1;
        };

        $scope.toggleAll = function (group) {
            if (!$scope.currentRolePermission) {
                return false;
            }
            if ($scope.selectAllIsChecked(group)) {
                rolePermissionIds[group] = [];
            } else {
                rolePermissionIds[group] = _.map(groupPermissions[group], "id");
            }
        };

        $scope.saveRolePermission = function () {
            var permissionIds = _.concat(rolePermissionIds['Other'], rolePermissionIds["Foundation Data"]);
            $scope.currentRolePermission.permissionIds = permissionIds;
            $scope.loading = true;
            rolePermissionService.update($scope.currentRolePermission.roleId, $scope.currentRolePermission).then(function () {
                $scope.loading = false;
                lincUtil.saveSuccessfulPopup();
                initRolePermissionIds = angular.copy(rolePermissionIds);
            }, function (err) {
                $scope.loading = false;
                lincUtil.processErrorResponse(err);
            });
        };

        $scope.cancel = function () {
            rolePermissionIds = angular.copy(initRolePermissionIds);
        };

        $scope.selectAllIsChecked = function (group) {
            var permissions = groupPermissions[group];
            if (!permissions || !$scope.currentRolePermission) {
                return false;
            }
            var permissionIds = rolePermissionIds[group];
            if (permissionIds && permissionIds.length == permissions.length) {
                return true;
            } else {
                return false;
            }
        };

        function initSetAllPermissions(permissions) {
            var permissions = _.sortBy(permissions, 'name');
            permissionNameMap = _.keyBy(permissions, "name");
            _.forEach(permissions, function (permission) {
                var arr = permission.name.split("::");
                if (permission.name.indexOf("::") > -1) {
                    permission.commonName ="[" + arr[0] + "] : "+ arr[arr.length - 1].split("_")[0] ;
                } else {
                    permission.commonName = arr[arr.length - 1].split("_")[0];
                }

            });
           // permissions = permissionService.sortPermissionsByName(permissions);
            groupPermissions = _.groupBy(permissions, 'groupName');
            $scope.permissionsMapByCommonName["Other"] = _.groupBy(groupPermissions["Other"], "commonName");
            $scope.permissionsMapByCommonName["Foundation Data"] = _.groupBy(groupPermissions["Foundation Data"], "commonName");
        }

        $scope.capitalAndAddSpaceBetweenCamelCase = function (text) {
            return lincUtil.capitalAndAddSpaceBetweenCamelCase(text);
        }

        function _init() {
            $scope.searchCompleted = false;
            var promises = [];
            promises.push(userRoleService.queryAll());
            promises.push(permissionService.search({}));
            $q.all(promises).then(function (response) {
                $scope.searchCompleted = true;
                $scope.roles = response[0];
                initSetAllPermissions(response[1]);
                $scope.editRolePermission($scope.roles[0].id);
            }, function (err) {
                $scope.searchCompleted = true;
                lincUtil.processErrorResponse(err);
            });
        }

        _init();
    };

    ctrl.$inject = ['$scope', '$state', '$q', 'lincUtil', 'userRoleService', 'permissionService', 'rolePermissionService'];
    return ctrl;
});
