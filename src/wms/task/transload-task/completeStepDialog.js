'use strict';

define([
    'angular',
    'lodash'
], function (angular, _) {
    var controller = function ($scope, $mdDialog, transloadTaskService, stepId, taskId, tips) {
        $scope.resonInfo = {};
        $scope.submit = function () {
            $scope.saving = true;
            if (tips === "Close Task") {
                forceCloseTask();
            }
            else {
                forceCloseStep();
            }
        };

        $scope.closeDialog = function () {
            $mdDialog.cancel();
        };

        function forceCloseTask() {
            transloadTaskService.forceCloseTask(taskId, { reason: $scope.resonInfo.reason }).then(function () {
                $scope.saving = false;
                $mdDialog.hide();
            }, function (error) {
                $scope.saving = false;
                $scope.errorMsg = error.data.error;
            });
        }

        function forceCloseStep() {
            transloadTaskService.forceCloseStep(taskId, stepId, { reason: $scope.resonInfo.reason }).then(function (response) {
                $scope.saving = false;
                $mdDialog.hide();
            }, function (error) {
                $scope.saving = false;
                $scope.errorMsg = error.data.error;
            });
        }
    };



    controller.$inject = ['$scope', '$mdDialog', 'transloadTaskService', 'stepId', 'taskId', 'tips'];

    return controller;
});
