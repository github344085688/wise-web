'use strict';

define([], function () {

    var controller = function ($scope, $q, $resource, $state, $stateParams, $mdDialog, userTagService, userRoleService,
        userService, organizationRelationshipService, companyService, rolePermissionService, permissionService, lincUtil, session) {

        var DEFAULT_USER_ENTITY = {
            isLoginByWindowsAD: false,
            username: '',
            password: '',
            firstName: '',
            lastName: '',
            role: '',
            tags: [],
            organization: '',
            status: "Active"
        };

        $scope.statusList = ['Active', 'Disabled', 'Locked'];
        $scope.selectedUser = null;
        $scope.currentUser = angular.copy(DEFAULT_USER_ENTITY);

        $scope.tags = [];
        $scope.userList = [];
        $scope.organizations = [];
        $scope.wiseCompanyIds = [];
        $scope.tmsCompanyIds = [];

        $scope.permissionsMapByCommonName = {};
        var groupPermissions = {};
        var rolePermissionIds = {};
        var initAllPermissions = {};

        $scope.ssoValidate;
        $scope.getTags = function () {
            return userTagService.queryAll().then(function (response) {
                $scope.tags = response;
            });
        };

        $scope.getUsers = function (keyword) {
            return userService.autoCompleteQuery(keyword).then(function (data) {
                $scope.userList = data;
            });
        };

        var discardConfirm = function (callback, param) {
            var dialog = $mdDialog.confirm()
                .title('Confirm')
                .textContent('Do you want to discard the changes of current user?')
                .ok('Yes')
                .cancel('No');

            $mdDialog.show(dialog).then(function () {
                callback(param);
            });
        };

        function getUserInfo(userId) {
            userService.getUserDetailById(userId).then(function (user) {
                $scope.currentUser = user;
                if($scope.currentUser.relatedCustomerId){
                    $scope.currentUser.relatedCustomerId = user.relatedCustomerId.split(',');
                }
                getRolePermissionByRoleId(user.roles)
                $scope.facilities = [];

                if(_.findIndex(user.invoiceAppCompanyIdsMappings, { 'app': 'WISE'}) > -1 ){
                    $scope.wiseCompanyIds = user.invoiceAppCompanyIdsMappings[ _.findIndex(user.invoiceAppCompanyIdsMappings, { 'app': 'WISE'})].companyIds;
                }
                if(_.findIndex(user.invoiceAppCompanyIdsMappings, { 'app': 'TMS'}) > -1 ){
                    $scope.tmsCompanyIds = user.invoiceAppCompanyIdsMappings[ _.findIndex(user.invoiceAppCompanyIdsMappings, { 'app': 'TMS'})].companyIds;
                }
            });

        }

        function organizationSubmitData() {
            var user = angular.copy($scope.currentUser);
            user.roleIds = _.map($scope.currentUser.roles, function (role) { return role.id; });
            user.tagIds = _.map($scope.currentUser.tags, function (tag) { return tag.id; });
           if(user.relatedCustomerId){
             user.relatedCustomerId = $scope.currentUser.relatedCustomerId.join(',');
           }
            angular.forEach(user.assignedCompanyFacilities, function (cf) {
                if (cf.company) {
                    cf.companyId = cf.company.id;
                }
                if (cf.facility) {
                    cf.facilityId = cf.facility.id;
                }
                delete cf.company;
                delete cf.facility;
            });
            delete user.searchCompany;
            delete user.searchFacility;
            user.invoiceAppCompanyIdsMappings = [];
            if($scope.wiseCompanyIds.length > 0){
                user.invoiceAppCompanyIdsMappings.push({ 'app': 'WISE', 'companyIds': $scope.wiseCompanyIds });
            }
            if($scope.tmsCompanyIds.length > 0){
                user.invoiceAppCompanyIdsMappings.push({ 'app': 'TMS', 'companyIds': $scope.tmsCompanyIds });
            }
            return user;
        }

        $scope.removeCompanyFacility = function (index) {
            $scope.currentUser.assignedCompanyFacilities.splice(index, 1);
            var defaultCf = $scope.currentUser.defaultCompanyFacility;
            if (defaultCf) {
                var findCf = findCfInAssignedCompanyFacilities(defaultCf);
                if (!findCf) {
                    $scope.currentUser.defaultCompanyFacility = null;
                }
            }
        };

        $scope.saveCompanyFacility = function () {
            if (!$scope.currentUser.assignedCompanyFacilities) {
                $scope.currentUser.assignedCompanyFacilities = [];
            }
            var cf = {
                company: $scope.currentUser.searchCompany,
                facility: $scope.currentUser.searchFacility
            };
            if ($scope.currentUser.searchCompany && $scope.currentUser.searchFacility) {
                var findCf = findCfInAssignedCompanyFacilities(cf);
                if (!findCf) {
                    $scope.currentUser.assignedCompanyFacilities.push(cf);
                } else {
                    lincUtil.messagePopup("Tip", "Already Has Same Company&Facility!");
                }
            } else {
                lincUtil.messagePopup("Tip", "Please Select Company & Facility First !");
            }

        };

        function findCfInAssignedCompanyFacilities(searchCf) {
            var findCf = _.find($scope.currentUser.assignedCompanyFacilities, function (cf) {
                return cf.company.id == searchCf.company.id &&
                    cf.facility.id == searchCf.facility.id
            });
            return findCf;
        }

        $scope.onSelectSearchCompany = function (companyId) {
            $scope.currentUser.searchFacility = null;
            $scope.facilities = [];
            organizationRelationshipService.searchRelationship({
                organizationId: companyId,
                relationship: "Facility", scenario: "ORGANIZATION_ONLY_THE_BASIC"
            }).then(function (response) {
                $scope.facilities = lincUtil.extractOrganizationBasicField(response);
            }, function (error) {
                lincUtil.processErrorResponse(error);
            });
        };
        $scope.verifySsoUserName = function (ssoUsername) {

            if (ssoUsername) {
                $scope.ssoValidate = "";
                $scope.isValidateloading = true;
                userService.validateSsoUseName(ssoUsername).then(function (response) {
                    $scope.isValidateloading = false;
                    if (response.success)
                        $scope.ssoValidate = 'OK';
                    else
                        $scope.ssoValidate = 'Fail'
                }, function (error) {
                    $scope.ssoValidate = 'Fail';
                    $scope.isValidateloading = false;
                    lincUtil.processErrorResponse(error);
                });
            }

        }

        function getCompanies() {
            companyService.searchCompany({}).then(function (response) {
                $scope.companies = lincUtil.extractOrganizationBasicField(response);
            });
        }


        $scope.addOrUpdateUser = function () {
            var user = organizationSubmitData();
            $scope.loading = true;
            if ($scope.isNew) {
                userService.save(user).then(function () {
                    $scope.loading = false;
                    lincUtil.saveSuccessfulPopup(function () {
                        $state.go("user.userManagement");
                    });
                }, function (error) {
                    $scope.loading = false;
                    lincUtil.processErrorResponse(error);
                });

            } else {
                userService.update(user).then(function () {
                    $scope.loading = false;
                    lincUtil.updateSuccessfulPopup(function () {
                        $state.go("user.userManagement");
                    });

                }, function (error) {
                    $scope.loading = false;
                    lincUtil.processErrorResponse(error);
                });

            }

        };

        $scope.cancelEditUser = function () {
            $state.go("user.userManagement");
        };

        $scope.getAllRolesAndAllPermission = function () {
            var promises = [];
            promises.push(userRoleService.queryAll());
            promises.push(permissionService.search({}));
            $q.all(promises).then(function (response) {
                $scope.roles = response[0];
                $scope.allpermissions = _.sortBy(response[1], 'name');
                _.forEach($scope.allpermissions, function (permission) {
                    var arr = permission.name.split("::");
                    if (permission.name.indexOf("::") > -1) {
                        permission.module = arr[0];
                    }
                    var tip = arr[arr.length - 1].split("_")[1];
                    permission.commonName = arr[arr.length - 1].split("_")[0];
                    if (tip === 'read') {
                        permission.hasRead = true;
                    }
                    if (tip === 'write') {
                        permission.hasWrite = true;
                    }
                    permission.name = null;
                });
                $scope.allpermissionsKeyById = _.keyBy($scope.allpermissions, 'id');
                initAllPermissions = angular.copy($scope.allpermissions);
                initSetAllPermissions($scope.allpermissions);
            }, function (err) {
                lincUtil.processErrorResponse(err);
            });

        };

        function getRolePermissionByRoleId(role) {
            if (role && role.length > 0) {
                var roleIds = _.map(role, 'id');
                var promises = [];
                _.forEach(roleIds, function (id) {
                    promises.push(rolePermissionService.get(id));
                });
                $q.all(promises).then(function (response) {
                    var flattenRolePermission = _.sortBy(_.flattenDeep(response), 'name');
                    var permissions = _.unionBy(flattenRolePermission, $scope.allpermissions, 'id');
                    _.forEach(permissions, function (permission) {
                        if (permission.name) {
                            permission = setPermissionReadOrWritePropety(permission);
                        }

                    });
                    initSetAllPermissions(permissions);
                }, function (err) {
                    lincUtil.processErrorResponse(err);
                });

            } else {
                initSetAllPermissions(initAllPermissions);
            }

        };

        function setPermissionReadOrWritePropety(permission) {
            var arr = permission.name.split("::");
            if (permission.name.indexOf("::") > -1) {
                permission.module = arr[0]
            }
            permission.commonName = arr[arr.length - 1].split("_")[0];
            var tip = arr[arr.length - 1].split("_")[1];
            if (tip === 'read') {
                permission.read = true;
            }
            if (tip === 'write') {
                permission.write = true;
            }
            return permission;
        }

        function initSetAllPermissions(permissions) {
            var permisssionsMapByGroup = _.groupBy(permissions, 'groupName');
            groupPermissions["common"] = permisssionsMapByGroup["Other"];
            groupPermissions["fd"] = angular.copy(permisssionsMapByGroup["Foundation Data"]);
            var commonDataGroupByCommonNameAndModule = _.groupBy(groupPermissions["common"], function (o) {
                return o.commonName + "|" + o.module;
            });
            var fdDataGroupByCommonNameAndModule = _.groupBy(groupPermissions["fd"], function (o) {
                return o.commonName + "|" + o.module;
            });
            $scope.permissionsMapByCommonName["common"] = organizationPermission(commonDataGroupByCommonNameAndModule);
            $scope.permissionsMapByCommonName["fd"] = organizationPermission(fdDataGroupByCommonNameAndModule);

        }

        function organizationPermission(groupByCommonName) {
            var orgPermissionList = [];

            _.forEach(groupByCommonName, function (values, key) {
                var obj = {};
                obj.commonName = key.split("|")[0];
                _.forEach(values, function (val) {
                    if ($scope.allpermissionsKeyById[val.id].hasRead) {
                        obj.hasRead = true;
                    }
                    if ($scope.allpermissionsKeyById[val.id].hasWrite) {
                        obj.hasWrite = true;
                    }
                    if (val.read) {
                        obj.read = val.read;
                    }
                    if (val.write) {
                        obj.write = val.write;
                    }
                    obj.module = val.module;
                });
                orgPermissionList.push(obj);
            });
            return orgPermissionList;
        }

        $scope.onSelectRole = function (role) {
            getRolePermissionByRoleId(role)
        };

        $scope.capitalAndAddSpaceBetweenCamelCase = function (text) {
            return lincUtil.capitalAndAddSpaceBetweenCamelCase(text);
        }

        function init() {
            $scope.getTags();
            getCompanies();
            $scope.isAddAction = $stateParams.userId ? false : true;
            if ($scope.isAddAction) {
                $scope.isNew = true;
                $scope.submitLabel = "Save";
                $scope.currentUser = angular.copy(DEFAULT_USER_ENTITY);
                $scope.selectedUser = null;
            } else {
                $scope.submitLabel = "Update";
                $scope.isNew = false;
                getUserInfo($stateParams.userId);
            }
            $scope.getAllRolesAndAllPermission();
        }

        init();
    };
    controller.$inject = ['$scope', '$q', '$resource', '$state', '$stateParams', '$mdDialog', 'userTagService', 'userRoleService',
        'userService', 'organizationRelationshipService', 'companyService', 'rolePermissionService', 'permissionService', 'lincUtil', 'session'];

    return controller;
});
