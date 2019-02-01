'use strict';

define([
    'angular',
    'lodash'
], function (angular, _) {
    var createPackTaskController = function ($scope, packService, generalTaskService, $state, $stateParams, lincUtil) {

        $scope.save = function () {
            var task = angular.copy($scope.packTask);
            if(!task.isUpdateStepAssignee) {
                task.isUpdateStepAssignee = false;
            }
            if($scope.isAddAction) {
                createTask(task);
            }else {
                editTask(task);
            }
        };
        
        function editTask(task) {
            $scope.loading = true;
            generalTaskService.updateTask(task).then(function (response) {
                $scope.loading = false;
                lincUtil.updateSuccessfulPopup(function () {
                    $state.go('wms.task.packTask.general.list');
                });
            }, function (error) {
                $scope.loading = false;
                lincUtil.processErrorResponse(error);
            });
        }
        
        function createTask(task) {
            $scope.loading = true;
            task.orderIds = $scope.orderIds;
            packService.createPackTask(task).then(function (response) {
                $scope.loading = false;
                lincUtil.messagePopup("Create Task", "Pack Task has been created successfully, TaskId:" + response.id, function () {
                    $state.go('wms.task.packTask.general.list');
                });
            }, function (error) {
                $scope.loading = false;
                lincUtil.processErrorResponse(error);
            });
        }

        $scope.cancel = function () {
            if(!$scope.isAddAction) {
                $state.go("wms.task.packTask.general.list");
            }else {
                lincUtil.confirmPopup("Leave Confirm", "Do you want to discard the changes?", function () {
                    $state.go('wms.outbound.pack.orderToPackTask');
                });
            }
        };
        
        function getTask(taskId) {
            packService.getTask(taskId).then(function (task) {
                $scope.packTask = task.task;
            }, function (error) {
                lincUtil.processErrorResponse(error);
            })
        }

        function _init() {
            if($stateParams.taskId) {
                $scope.isAddAction = false;
                $scope.formTitle = "Edit Pack Task";
                getTask($stateParams.taskId);
            }else {
                $scope.isAddAction = true;
                $scope.formTitle = "Add Pack Task";
                $scope.orderIds = $stateParams.orderIds;
                $scope.packTask = {};
                if (!$scope.orderIds) {
                    lincUtil.errorPopup("Please select at least an order to pack.", function () {
                        $state.go('wms.outbound.pack.orderToPackTask');
                    });
                    return;
                }
                $scope.packTask.orderIds = $scope.orderIds;
            }
        }

        _init();
    };

    createPackTaskController.$inject = ['$scope', 'packService', 'generalTaskService', '$state', '$stateParams', 'lincUtil'];
    return createPackTaskController;
});
