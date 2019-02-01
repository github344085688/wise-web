'use strict';

define(['lodash'], function(_) {
    var notifyController = function($scope, $state, $mdDialog, session, lincUtil, userTagService, userRoleService, userService, task) {

        $scope.userCheckOrUncheck = function(user) {
            if (_.findIndex($scope.checkedUsers, function(checkedUser) {
                    return checkedUser.idmUserId === user.idmUserId;
                }) > -1) {
                _.remove($scope.checkedUsers, function(checkedUser) {
                    return checkedUser.idmUserId === user.idmUserId;
                });
            } else {
                $scope.checkedUsers.push(user);
            }

        };


        $scope.userChecked = function(user) {
            return _.findIndex($scope.checkedUsers, function(checkedUser) {
                return checkedUser.idmUserId === user.idmUserId;
            }) > -1;
        };

        $scope.searchUserTags = function() {
            userTagService.queryAll().then(function(response) {
                if (response.error) {
                    lincUtil.errorPopup("Error:" + response.error);
                    return;
                }
                $scope.avaibleUserTags = response;
            });
        };

        $scope.getUserName = function (user) {
            if (user.firstName && user.lastName) {
                return user.firstName + " " + user.lastName;
            }
            return user.username;
        };

        $scope.searchUserRoles = function() {
            userRoleService.queryAll().then(function(response) {
                if (response.error) {
                    lincUtil.errorPopup("Error:" + response.error);
                    return;
                }
                $scope.avaibleUserRoles = response;
            });
        };

        $scope.searchUsers = function() {
            $scope.userFilter.warehouseOrgId = session.getCompanyFacility().facilityId;
            userService.searchUsers($scope.userFilter).then(function(response) {
                if (response.error) {
                    lincUtil.errorPopup("Error:" + response.error);
                    return;
                }
                $scope.users = response;
                _.forEach($scope.users, function (user) {
                    user.notifyUserName = $scope.getUserName(user).toLowerCase();
                })
                $scope.checkedUsers = [];
                $scope.users = _.sortBy($scope.users, ['notifyUserName']);
            }, function(error) {
                lincUtil.processErrorResponse(error);
            });
        };

        $scope.getStatus = function(dock) {
            if (!dock || !dock.locationName) {
                return;
            }
            if (dock.occupyEntryId && dock.occupyEntryId !== "") {
                return "Occupied";
            }
            return "Available";
        };

        $scope.cancel = function() {
            $mdDialog.cancel();
        };

        $scope.save = function() {
            $scope.notify.checkedUsers = $scope.checkedUsers;
            $mdDialog.hide($scope.notify);
        };

        function _init() {
            $scope.checkedUsers = [];
            $scope.checkedRoles = [];
            $scope.searchUserRoles();
            $scope.searchUserTags();
            $scope.notify = {};
            $scope.notify.taskNotes = task.note;
            $scope.userFilter = {};
            $scope.task = task;
            $scope.searchUsers();
        }

        _init();

    };

    notifyController.$inject = ['$scope', '$state', '$mdDialog', 'session', 'lincUtil', 'userTagService', 'userRoleService', 'userService', 'task'];
    return notifyController;

});
