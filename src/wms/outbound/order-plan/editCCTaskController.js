'use strict';

define([
    'angular',
    'lodash'
], function (angular, _) {
    var controller = function ($scope, $state, $mdDialog, configurationChangeTaskService, taskId) {
        var currentPlannedAssignee;
        $scope.submit = function () {
            if($scope.isLoading) {
                return;
            }
            var task = getTaskSaveInfo();
            configurationChangeTaskService.updateTask(task).then(function() {
                $scope.saving = false;
                $scope.task.plannedAssignee = currentPlannedAssignee;
                $mdDialog.hide($scope.task);
            }, function(error) {
                $scope.saving = false;
                $scope.errorMsg = error.message;
            });
        };

        function getTaskSaveInfo() {
            var task = {};
            task.plannedAssigneeUserId = $scope.task.plannedAssigneeUserId;
            task.priority = $scope.task.priority;
            task.id = $scope.task.id;
            return task;
        }

        $scope.onSelectUser = function (user) {
            currentPlannedAssignee = user;
        };

        $scope.cancel = function() {
            $mdDialog.cancel();
        };

        function getTask(taskId) {
            $scope.isLoading = true;
            configurationChangeTaskService.getTaskBasicInfoById(taskId).then(function (pickTask) {
                $scope.isLoading = false;
                $scope.task = pickTask;
            }, function (error) {
                $scope.isLoading = false;
            });
        }

        function init() {
            getTask(taskId);
        }

        init();
    };

    controller.$inject = ['$scope', '$state',  '$mdDialog', 'configurationChangeTaskService', 'taskId'];

    return controller;
});