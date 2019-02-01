'use strict';

define(['angular', 'lodash'], function (angular, _) {
    var controller = function ($scope, $mdDialog, uomDefinition) {


        if (uomDefinition) {
            $scope.submitLabel = "Update";
            $scope.uomDefinition = uomDefinition;
        } else {
            $scope.submitLabel = "Save";
            $scope.uomDefinition = {};
        }


        $scope.cancel = function () {
            $mdDialog.cancel();
        };

        $scope.submit = function () {
            if ($scope.uomDefinition.name)
                $mdDialog.hide($scope.uomDefinition);
        };


    };
    controller.$inject = ['$scope', '$mdDialog', 'uomDefinition'];
    return controller;
});