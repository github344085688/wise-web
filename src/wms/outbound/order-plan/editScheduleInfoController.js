'use strict';

define([], function () {
    var controller = function ($scope, $state, $mdDialog) {

        $scope.submit = function () {
            $mdDialog.hide($scope.scheduleInfo);
        };

        $scope.cancel = function () {
            $mdDialog.cancel();
        };

    }

    controller.$inject = ['$scope', '$state', '$mdDialog']

    return controller;
});
