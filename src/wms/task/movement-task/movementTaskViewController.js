'use strict';

define([
    'angular',
    'lodash'
], function(angular, _) {
    var controller = function ($scope, $state, $stateParams, movementTaskService) {
        function getTask(taskId) {
            movementTaskService.getTaskById(taskId).then(function (response) {
                $scope.task = response;
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

        init();
    }

    controller.$inject = ['$scope', '$state', '$stateParams', 'movementTaskService'];
    return controller;
})