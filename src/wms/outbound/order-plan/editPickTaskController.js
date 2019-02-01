'use strict';

define([
    'angular',
    'lodash'
], function (angular, _) {
    var controller = function ($scope, $state, $mdDialog, pickService, taskId) {
        var currentPlannedAssignee;
        $scope.weightUnits =[ 'G','KG','Pound' ];
        $scope.remove = function (index) {
            $scope.task.pickRounds.splice(index, 1);
        }
        $scope.add = function () {
            $scope.task.pickRounds.push({weightUnit:'Pound'});
        }
        $scope.submit = function () {
            if($scope.isLoading) {
                return;
            }
            var task = getTaskSaveInfo();
            pickService.updatePickTask(task).then(function() {
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
            task.isRush = $scope.task.isRush;
            task.description = $scope.task.description;
            task.priority = $scope.task.priority;
            task.id = $scope.task.id;
            task.pickRounds = $scope.task.pickRounds;
            return task;
        }

        $scope.onSelectUser = function (user) {
            currentPlannedAssignee = user;
        };

        $scope.cancel = function() {
            $mdDialog.cancel();
        };

        function getPickTask(taskId) {
            $scope.isLoading = true;
            pickService.getPickTask(taskId).then(function (pickTask) {
                $scope.isLoading = false;
                $scope.task = pickTask;
                if(!$scope.task.pickRounds){
                    $scope.task.pickRounds = [{weightUnit:'Pound'}];
                }
            }, function (error) {
                $scope.isLoading = false;
            });
        }

        function init() {
            getPickTask(taskId);
        }

        init();
    };

    controller.$inject = ['$scope', '$state',  '$mdDialog', 'pickService', 'taskId'];

    return controller;
});