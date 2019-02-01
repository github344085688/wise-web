'use strict';

define(['angular', 'lodash'], function(angular, _) {
    var controller = function($scope, itemLine, $mdDialog, itemService) {
        initSet();
        function initSet() {
            $scope.itemLine = itemLine;
            $scope.itemLine.unitName = itemLine.unit.name;
            itemService.getBundle({itemSpecId: itemLine.itemSpecId, diverseProperties: itemLine.properties}).then(function (itemBundle) {
                $scope.itemLine.itemBundle = itemBundle;
            });
        }

        $scope.cancel = function () {
            $mdDialog.cancel();
        };

    };
    controller.$inject = ['$scope','itemLine', '$mdDialog', 'itemService'];
    return controller;
});