'use strict';

define([
    'angular',
    'lodash',
    './taskAssigneeEditController'
], function(angular, _, taskAssigneeEditController) {
    var controller = function ($scope, $state, $stateParams, inventoryMovementTaskService, $mdDialog) {
        function getTask(taskId) {
            inventoryMovementTaskService.getTask(taskId).then(function (response) {
                $scope.task = response.task;
                $scope.processesGroupByStepId = response.processesGroupByStepId;
                initActiveTabs($scope.task.steps);
            });
        }

        function init() {
            getTask($stateParams.taskId);
        }

        function initActiveTabs(steps) {
            $scope.activeTabs = {};
            angular.forEach(steps, function (step) {
                $scope.activeTabs[step.id] = "content";
            });
        }

        $scope.changeTab = function (tab, stepId) {
            $scope.activeTabs[stepId] = tab;
        };

        $scope.editTask = function () {
            $state.go('wms.task.movementTask.edit', {taskId: $scope.task.id});
        };

        $scope.openEditAssignee = function (taskId) {
            $mdDialog.show({
                templateUrl: 'wms/task/inventory-movement-task/template/taskAssigneeEdit.html',
                controller: taskAssigneeEditController,
                locals: {
                    taskId: taskId
                },
            }).then(function () {
                init();
            });
        };

        init();
    }

    controller.$inject = ['$scope', '$state', '$stateParams', 'inventoryMovementTaskService', '$mdDialog'];
    return controller;
})