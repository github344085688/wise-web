'use strict';

define([
    'angular',
    'lodash'
], function(angular, _) {
    var controller = function ($scope, $state, $stateParams, putBackTaskService) {
        function getTask(taskId) {
            putBackTaskService.getTaskDetailById(taskId).then(function (response) {
                $scope.task = response.putBackTask;
                $scope.historyItemLines = response.historyItemLines;
                initActiveTabs($scope.task.steps);
            },function(error){
                lincUtil.processErrorResponse(error);
            });
        }
   
        function initActiveTabs(steps) {
            $scope.changeMainTab("itemLines");
            $scope.activeTabs = {};
            angular.forEach(steps, function (step) {
                $scope.activeTabs[step.id] = "content";
            });
        }

        $scope.changeTab = function (tab, stepId) {
            $scope.activeTabs[stepId] = tab;
        };

        $scope.changeMainTab = function (tab) {
            $scope.activeMainTab = tab;
        }
        
        $scope.editTask = function () {
            $state.go("wms.task.putBackTask.edit", {taskId: $stateParams.taskId});
        }

        function init() {
            getTask($stateParams.taskId);
        }
        init();
    }
    controller.$inject = ['$scope', '$state', '$stateParams', 'putBackTaskService', 'entryService'];
    return controller;
});