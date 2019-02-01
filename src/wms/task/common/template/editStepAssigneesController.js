'use strict';

define([
    'angular',
    'lodash'
], function (angular, _) {
    var controller = function ($scope, generalStepService, step) {
        $scope.save = function () {
            $scope.errorMsg = "";
            $scope.loading = true;
            generalStepService.updateStep(step).then(function (response) {
                $scope.loading = false;
                $mdDialog.hide(step);
            }, function (error) {
                $scope.errorMsg = error.message;
                $scope.loading = false;
            });
        };

        $scope.cancel = function () {
            $mdDialog.cancel();
        };

        function _init() {
            $scope.step = angular.copy(step);
        }

        _init();
    };

    controller.$inject = ['$scope', 'generalStepService', step];
    return controller;
});
