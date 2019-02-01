'use strict';

define(['angular', 'lodash'], function (angular, _) {
  var controller = function ($scope, $mdDialog, conveyorService, lincUtil, storeDetail) {


    $scope.storeDetail = storeDetail;

    $scope.cancel = function () {
      $mdDialog.cancel();
    };

  };
  controller.$inject = ['$scope', '$mdDialog', 'conveyorService', 'lincUtil', 'storeDetail'];
  return controller;
});