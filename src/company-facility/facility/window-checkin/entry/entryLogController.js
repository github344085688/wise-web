'use strict';

define(['angular', 'lodash'], function (angular, _) {
    var controller = function ($scope, $state, $mdDialog, entry) {

        $scope.ok = function () {

            $mdDialog.hide();
        };
        $scope.cancel = function () {
            $mdDialog.cancel();
        };
        function init() {
            $scope.entry = entry;
        }

        init();

    };
    controller.$inject = ['$scope', '$state', '$mdDialog', 'entry'];
    return controller;
});
