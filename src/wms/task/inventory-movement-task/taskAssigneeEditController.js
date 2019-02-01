'use strict';

define(['angular', 'lodash'], function (angular, _) {
  var controller = function ($scope, $mdDialog, lincUtil, taskId, generalTaskService) {

    $scope.task = {};
    $scope.task.id = taskId;

    $scope.closeDialog = function () {
      $mdDialog.cancel();
    };

    function editTask(task) {
      $scope.loading = true;
      generalTaskService.updateTask(task).then(function() {
          $scope.loading = false;
          lincUtil.saveSuccessfulPopup();
          $mdDialog.hide();
      },function(error) {
          $scope.loading = false;
          lincUtil.processErrorResponse(error);
      });
  }

    $scope.submit = function () {
       editTask($scope.task);
    }
  };
  controller.$inject = ['$scope', '$mdDialog', 'lincUtil', 'taskId', 'generalTaskService'];
  return controller;
});