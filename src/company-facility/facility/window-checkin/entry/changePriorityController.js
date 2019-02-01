'use strict';

define(['angular', 'lodash'], function (angular, _) {
    var controller = function ($scope, $mdDialog, waitingInfo, entryName) {

        $scope.taskPrioritys = ["LOW", "MIDDLE", "HIGH", "TOP"];

        $scope.entryName = entryName;
        $scope.waitInfoMap = {};
        $scope.waitInfoMap.priority = waitingInfo.priority;
        $scope.waitInfoMap.contactInfo = waitingInfo.contactInfo;
        $scope.cancel = function () {
            $mdDialog.cancel();
        };

        $scope.submit = function () {
            $mdDialog.hide($scope.waitInfoMap);

        };


    };
    controller.$inject = ['$scope', '$mdDialog', 'waitingInfo', 'entryName'];
    return controller;
});