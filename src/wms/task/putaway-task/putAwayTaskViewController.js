'use strict';

define([
    'angular',
    'lodash'
], function(angular, _) {
    var controller = function ($scope, $state, $stateParams, putAwayTaskService) {
        function getTask(taskId) {
            putAwayTaskService.getTask(taskId).then(function (response) {
                $scope.task = response;
                initActiveTabs($scope.task.steps);
            },function(error){
                lincUtil.processErrorResponse(error);
            });
        }

        $scope.getStyle = function (isPutAway) {
            if(isPutAway) {
                return "{background-color: #c0edf1}";
            }else {
                return "{background-color: rgb(241, 192, 201}";
            }
        };

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
            $state.go("wms.task.putAwayTask.edit", {taskId: $scope.task.id});
        };

        init();
    }

    controller.$inject = ['$scope', '$state', '$stateParams', 'putAwayTaskService'];
    return controller;
})