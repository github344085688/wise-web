'use strict';

define([
    'angular',
    'lodash'
], function (angular, _) {
    var controller = function ($scope, $state, $stateParams, parcelPackTaskService, lincUtil) {

        function getTask(taskId) {
            parcelPackTaskService.getTask(taskId).then(function (response) {
                $scope.task = response;
                initActiveTabs($scope.task.steps);
            });
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

        $scope.reopenTask = function (task) {
            lincUtil.confirmPopup('Tip', 'Would you like to reopen this parcel pack task?', function () {
                parcelPackTaskService.reopenTask(task.id).then(function () {
                    lincUtil.messagePopup("Info", "Reopen pack task successful.");
                    init();
                }, function (error) {
                    lincUtil.processErrorResponse(error);
                });
            });
        };

        $scope.reopenStep = function (step) {
            lincUtil.confirmPopup('Tip', 'Would you like to reopen this step?', function () {
                parcelPackTaskService.reopenStep($scope.task.id, step.id).then(function () {
                    lincUtil.updateSuccessfulPopup(function () {
                        step.status = "In Progress";
                    });
                }, function (error) {
                    lincUtil.errorPopup('Update Error! ' + error.data.error);
                });
            });
        };

        function init() {
            getTask($stateParams.taskId);
        }


        init();
    };
    controller.$inject = ['$scope', '$state', '$stateParams', 'parcelPackTaskService', 'lincUtil'];
    return controller;
});