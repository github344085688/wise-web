'use strict';

define([
    'angular',
    'src/user/tag/tagManagementPageController',
    'src/user/role/roleManagementPageController',
    'src/user/permission/permissionListController',
    'src/user/role/rolePermissionListController',
    'src/user/usermanagement/userManagementPageController',
    'src/user/usermanagement/editUserManagementPageController'

], function (angular, tagManagementPageController, roleManagementPageController,
    permissionListController, rolePermissionListController,
    userManagementPageController,editUserManagementPageController) {
        angular.module('linc.user.main', [])
            .config(['$stateProvider', function ($stateProvider) {
                $stateProvider.state('user.tag', {
                    url: '/tag',
                    templateUrl: 'user/tag/template/tag.html',
                    controller: tagManagementPageController,
                    data: {
                        permissions: "user::tag_read",
                        title: "User Tag"
                    }
                }).state('user.role', {
                    url: '/role',
                    templateUrl: 'user/role/template/role.html',
                    controller: roleManagementPageController,
                    data: {
                        permissions: "user::role_read",
                        title: "User Role"
                    }
                }).state('user.permission', {
                    url: '/permission',
                    templateUrl: 'user/permission/template/permissionList.html',
                    controller: permissionListController,
                    data: {
                        permissions: "user::permission_read",
                        title: "User Permission"
                    }
                }).state('user.rolePermission', {
                    url: '/role-permission',
                    template: '<ui-view></ui-view>'
                }).state('user.rolePermission.list', {
                    url: '/list',
                    templateUrl: 'user/role/template/rolePermissionList.html',
                    controller: rolePermissionListController,
                    controllerAs: "ctrl",
                    data: {
                        permissions: "user::rolePermission_read"
                    }
                })
                    .state('user.userManagement', {
                        url: '/user-management',
                        views: {
                            "unis-main@user.userManagement": {
                                templateUrl: 'user/usermanagement/template/user.html',
                                controller: userManagementPageController
                            },
                            "@": {
                                template: ""
                            },
                            "unis@": {
                                templateUrl: 'common/template/unis-main.html',
                                controller: 'DefaultMainPageController'
                            }
                        },
                        data: {
                            permissions: "user::userManagement_read",
                            title: "User Management"
                        }
                    })
                    .state('user.userManagement.add', {
                        url: '/add',
                        views: {
                            "unis-main@user.userManagement.add": {
                                templateUrl: 'user/usermanagement/template/editUser.html',
                                controller: editUserManagementPageController

                            },
                            "@": {
                                template: ""
                            },
                            "unis@": {
                                templateUrl: 'common/template/unis-main.html',
                                controller: 'DefaultMainPageController'
                            }
                        },
                        resolve: {
                            'isAddAction': function () {
                                return true;
                            }
                        },
                        data: {
                            permissions: "user::userManagement_write",
                            title: "User Management"
                        }
                    })
                    .state('user.userManagement.edit', {
                        url: '/edit/:userId',
                        views: {
                            "unis-main@user.userManagement.edit": {
                                templateUrl: 'user/usermanagement/template/editUser.html',
                                controller: editUserManagementPageController
                            },
                            "@": {
                                template: ""
                            },
                            "unis@": {
                                templateUrl: 'common/template/unis-main.html',
                                controller: 'DefaultMainPageController'
                            }
                        },
                        resolve: {
                            'isAddAction': function () {
                                return false;
                            }
                        },
                        data: {
                            permissions: "user::userManagement_write",
                            title: "User Management"
                        }
                    });
            }]).controller('TagManagementPageController', tagManagementPageController)
            .controller('RoleManagementPageController', roleManagementPageController)
            .controller('PermissionListController', permissionListController)
            .controller('RolePermissionListController', rolePermissionListController)
            .controller('EditUserManagementPageController', editUserManagementPageController)
            .controller('UserManagementPageController', userManagementPageController);

    });