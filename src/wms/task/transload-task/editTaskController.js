'use strict';

define([
    'angular',
    'lodash'
], function (angular, _) {
    var controller = function ($scope, packService, generalTaskService, $state, $stateParams, lincUtil) {

        $scope.save = function () {
            var task = angular.copy($scope.task);
            if(!task.isUpdateStepAssignee) {
                task.isUpdateStepAssignee = false;
            }
            if(!$scope.isAddAction) {
                editTask(task);
            }
        };
        
        function editTask(task) {
            $scope.loading = true;
            generalTaskService.updateTask(task).then(function (response) {
                $scope.loading = false;
                lincUtil.updateSuccessfulPopup(function () {
                    $state.go('wms.task.transloadTask.list');
                });
            }, function (error) {
                $scope.loading = false;
                lincUtil.processErrorResponse(error);
            });
        }

        $scope.cancel = function () {
            $state.go("wms.task.transloadTask.list");
        };

        function getTask(taskId) {
            generalTaskService.getTask(taskId).then(function (task) {
                $scope.task = task;
            }, function (error) {
                lincUtil.processErrorResponse(error);
            })
        }

        function _init() {
            if($stateParams.taskId) {
                $scope.isAddAction = false;
                getTask($stateParams.taskId);
            }
        }

        _init();
    };

    controller.$inject = ['$scope', 'packService', 'generalTaskService', '$state', '$stateParams', 'lincUtil'];
    return controller;
});
