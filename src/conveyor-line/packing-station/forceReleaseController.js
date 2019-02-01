'use strict';

define(['angular', 'lodash'], function (angular, _) {
  var controller = function ($scope, $mdDialog, conveyorService, lincUtil, storeDetail, storeNo) {


    $scope.storeDetail = storeDetail;

    $scope.cancel = function () {
      $mdDialog.cancel();
    };

    if ($scope.storeDetail.packedCLPNum < $scope.storeDetail.pickedCLPNum) {
      $scope.message = "Not allowed to release this branch. CLP Pack not yet finished for store:"+storeNo+" .";
    } else if ($scope.storeDetail.packedCLPNum == $scope.storeDetail.pickedCLPNum && $scope.storeDetail.unfinishedPickTaskIds.length > 0) {
      $scope.message = "Not allowed to release this branch. Pick not yet finished for store:"+storeNo+" .";
    }
    $scope.confirm = function () {
      $mdDialog.hide();
    }
  };
  controller.$inject = ['$scope', '$mdDialog', 'conveyorService', 'lincUtil', 'storeDetail', 'storeNo'];
  return controller;
});