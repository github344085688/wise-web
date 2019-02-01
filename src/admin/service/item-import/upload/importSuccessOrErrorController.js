'use strict';

define(['angular', 'lodash'], function (angular, _) {
    var controller = function ($scope, $mdDialog, Items) {




        $scope.failItems = Items.failItems;
  
        $scope.cancel = function () {
            $mdDialog.cancel();
        };




    };
    controller.$inject = ['$scope', '$mdDialog', 'Items'];
    return controller;
});