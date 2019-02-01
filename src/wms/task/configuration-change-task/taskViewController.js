'use strict';

define([
    'lodash',
    'angular'
], function (_, angular) {
    var controller = function ($scope, $state, $stateParams, configurationChangeTaskService, lincUtil) {

        initSet();
        function initSet() {
            $scope.materialLinesSearchParam = {ccTaskIds: [$stateParams.taskId]};
            if ($stateParams.taskId) {
                getTask($stateParams.taskId);
            }
        }

        function getTask(taskId) {
            configurationChangeTaskService.getTaskById(taskId).then(function(task)
            {
                // $scope.tasks = response;
                $scope.task = task;
            }, function (error) {
                lincUtil.processErrorResponse(error);
            });
        }

        $scope.separateTask = function (taskId) {
            $state.go('wms.task.configurationChangeTask.separate', {
                taskId: taskId
            });
        };

        $scope.mergeTask = function (taskId) {
            $state.go('wms.task.configurationChangeTask.merge', {
                taskId: taskId
            });
        }

        $scope.editTask = function (taskId) {
            $state.go('wms.task.configurationChangeTask.edit', {taskId: taskId});
        };
    };
    controller.$inject = ['$scope', '$state', '$stateParams', 'configurationChangeTaskService','lincUtil'];
    return controller;
});


