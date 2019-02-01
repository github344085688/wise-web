/**
 * Created by Giroux on 2017/3/28.
 * * Modify by Jerry on 2017/7/25.
 */

'use strict';

define(['jquery', 'lodash', './directives'], function ($, _, directives) {
    directives.directive('userSelectFilter', ["$document", "userRoleService", "userTagService", "userService", "session",
        function ($document, userRoleService, userTagService, userService, session) {

            return {
                restrict: "EA",
                templateUrl: 'common/directive/template/userSelectFilter.html',

                scope: {
                    ngModel: '=',
                    onSelect: '&'
                },
                link: function ($scope, element) {
                    $scope.isCheckListOpen = false;
                    $scope.checkListOpen = function () {
                        $scope.isCheckListOpen = true;
                        $scope.userKeyWord = "";
                        $scope.searchUsers();
                    };

                    $scope.selectedUser = null;
                    $scope.selectUser = function (user) {
                        $scope.selectedUser = user;
                        $scope.isCheckListOpen = false;
                        $scope.ngModel = $scope.selectedUser.idmUserId;
                        $scope.userKeyWord = $scope.getUserName(user);
                        if ($scope.onSelect) {
                            $scope.onSelect({ user: user });
                        }
                    };

                    $scope.getUserName = function (user) {
                        if (!user) return "";
                        if (user.firstName && user.lastName) {
                            return user.firstName + " " + user.lastName;
                        }
                        return user.username;
                    };

                    $scope.userRoleId = null;
                    $scope.userTagId = null;
                    $scope.users = [];
                    $scope.searchUsers = function (data, tag) {
                        if (tag == "role") {
                            if (!data) {
                                $scope.userRoleId = null;
                            } else {
                                $scope.userRoleId = data.id;
                            }
                        } else if (tag == "tag") {
                            if (!data) {
                                $scope.userTagId = null;
                            } else {
                                $scope.userTagId = data.id;
                            }
                        }

                        var userFilter = {};
                        userFilter.warehouseOrgId = session.getCompanyFacility().facilityId;
                        userFilter.roleIds = [];
                        userFilter.status="Active";
                        if ($scope.userRoleId) {
                            userFilter.roleIds.push($scope.userRoleId)
                        }

                        userFilter.tagIds = [];
                        if ($scope.userTagId) {
                            userFilter.tagIds.push($scope.userTagId)
                        }

                        if ($scope.userKeyWord) {
                            userFilter.keyword = $scope.userKeyWord;
                        }

                        userService.searchUsers(userFilter).then(function (response) {
                            if (response.error) {
                                return;
                            }
                            $scope.users = response;
                            _.forEach($scope.users, function (user) {
                                user.notifyUserName = $scope.getUserName(user).toLowerCase();
                            })
                            $scope.users = _.sortBy($scope.users, ['notifyUserName']);

                            if (userSelectId && !$scope.selectedUser) {

                                $scope.selectedUser = _.find($scope.users, function (user) {
                                    return userSelectId == user.idmUserId;
                                });

                                $scope.userKeyWord = $scope.getUserName($scope.selectedUser);
                            }
                        });
                    };

                    var userSelectId;
                    $scope.$watch("ngModel", function (val) {
                       
                        userSelectId = val;
                    });

                    function searchUserTags() {
                        userTagService.queryAll().then(function (response) {
                            if (response.error) {
                                return;
                            }
                            $scope.avaibleUserTags = response;
                        });
                    }
                    function searchUserRoles() {
                        userRoleService.queryAll().then(function (response) {
                            if (response.error) {
                                return;
                            }
                            $scope.avaibleUserRoles = response;
                        });
                    }

                    function hideSelectDownPanelOnDocumentClick(e) {

                        if (!$scope.isCheckListOpen) return;

                        var contains = false;
                        if (window.jQuery) {
                            contains = window.jQuery.contains(element[0], e.target);
                        } else {
                            contains = element[0].contains(e.target);
                        }

                        if (!contains && !$scope.clickTriggeredSelect) {
                            $scope.$apply(function () {
                               $scope.userKeyWord = $scope.getUserName($scope.selectedUser);
                                $scope.isCheckListOpen = false;
                            })
                        }
                        $scope.clickTriggeredSelect = false;
                    }

                    $document.on('click', hideSelectDownPanelOnDocumentClick);
                   
                    $scope.changeAssign = function (userKeyWord) {
                        $scope.searchUsers();   
                    }
               
                    function init() {
                        $scope.searchUsers();
                        searchUserTags();
                        searchUserRoles();
                    }
                    init();

                }
            };
        }]);
});
