'use strict';

define(['angular', 'lodash'], function (angular, _) {
    var controller = function ($scope, $mdDialog,selectDock, selectedTaskDocks) {


        $scope.selectedTaskDocks = selectedTaskDocks;
        $scope.isSelectDock = false;
        $scope.cancel = function () {
            $mdDialog.cancel();
        };
        $scope.entry = {};
        $scope.entry.dockId=selectDock;
        $scope.submit = function () {
            if ($scope.entry.dockId)
                $mdDialog.hide($scope.entry.dockId);
            else
                $scope.isSelectDock = true;

        };


    };
    controller.$inject = ['$scope', '$mdDialog', 'selectDock','selectedTaskDocks'];
    return controller;
});