'use strict';

define(['angular', 'lodash'], function (angular, _) {
    var controller = function ($scope, $mdDialog, emptyLocationItemlines) {
        $scope.cancel = function () {
            $mdDialog.cancel();
        };
        $scope.emptyLocationItemlines =emptyLocationItemlines;
    };
    controller.$inject = ['$scope', '$mdDialog', 'emptyLocationItemlines'];
    return controller;
});
