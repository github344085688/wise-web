'use strict';

define(['angular', 'lodash'], function (angular, _) {
    var controller = function ($scope, $mdDialog) {

        $scope.cloneSettings = {};
        $scope.cancel = function () {
            $mdDialog.cancel();
        };

        $scope.clone = function () {  
            $mdDialog.hide($scope.cloneSettings.customerId);
        };

    };
    controller.$inject = ['$scope', '$mdDialog'];
    return controller;
});
