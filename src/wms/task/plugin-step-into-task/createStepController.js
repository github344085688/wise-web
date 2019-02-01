/**
 * Created by Giroux on 2017/1/18.
 */

'use strict';

define(['angular', 'lodash'], function(angular, _) {
    var controller = function($scope, $mdDialog, lincUtil, session, userService, step) {

        $scope.submitStep = function() {
            $mdDialog.hide(angular.copy($scope.step));
        };
        
        $scope.closeDialog = function () {
            $mdDialog.cancel();
        };

        $scope.getUsers = function(keyword) {
            var companyFacility = session.getCompanyFacility();
            var param = keyword ? {
                "username": keyword,
                "facilityId": companyFacility.facilityId,
                "companyId": companyFacility.companyId
            } : {"facilityId": companyFacility.facilityId,
                "companyId": companyFacility.companyId};
            return userService.searchUsers(param).then(function(response) {
                $scope.userList = response;
            },function(error){
                lincUtil.processErrorResponse(error);
            });
        };

        function init() {
            if (step) {
                $scope.title = "Edit General Step";
                $scope.submitLabel = "update";
                $scope.step = angular.copy(step);
            } else {
                $scope.title = "Create General Step";
                $scope.submitLabel = "save";
                $scope.step = {};
            }
        }
        init();
    }

    controller.$inject = ['$scope', '$mdDialog', 'lincUtil', 'session', 'userService', 'step'];
    return controller;
});