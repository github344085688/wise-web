'use strict';

define([
    'angular',
    'lodash'
], function (angular, _) {
    var controller = function ($scope, $state, $stateParams, parcelLoadTaskService, entryService, lincUtil) {
        function getTask(taskId) {
            parcelLoadTaskService.getTask(taskId).then(function (response) {
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


        $scope.reopenStep = function (step) {
            lincUtil.confirmPopup('Tip', 'Would you like to reopen this step?', function () {
                parcelLoadTaskService.reopenStep($scope.task.id, step.id).then(function () {
                    lincUtil.updateSuccessfulPopup(function () {
                        step.status = "In Progress";
                    });
                }, function (error) {
                    lincUtil.processErrorResponse(error);
                });
            });
        };

        init();
    }
    controller.$inject = ['$scope', '$state', '$stateParams', 'parcelLoadTaskService', 'entryService', 'lincUtil'];
    return controller;
});