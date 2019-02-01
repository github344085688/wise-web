'use strict';

define([
    'angular',
    'lodash'], function (angular, _) {

        var controller = function ($scope, $state, $stateParams,
            locationService, receiveTaskService, lincUtil) {

            $scope.pageSize = 10;
            $scope.submitLabel = "Update";
            var originalDock;

            $scope.submit = function () {
                var task = angular.copy($scope.task);
                if(!task.isUpdateStepAssignee) {
                    task.isUpdateStepAssignee = false;
                }
                if (task.dockId != originalDock) {
                    releaseDock(task);
                }
                else {
                    updateTask(task);
                }

            };
            function updateTask(task) {
                $scope.loading = true;
                receiveTaskService.updateTask(task).then(function () {
                    $scope.loading = false;
                    lincUtil.updateSuccessfulPopup(function () {
                        $state.go("wms.task.receiveTask.list");
                    });
                }, function (error) {
                    $scope.loading = false;
                    lincUtil.processErrorResponse(error);
                });
            }
            function reserveOrOccupyDock(task) {

                if (task.status === "New") {
                    locationService.reserveDock(task.dockId, task.entryId).then(function (response) {
                        updateTask();

                    }, function (error) {

                        lincUtil.processErrorResponse(error);

                    });
                }
                if (task.status === "In Progress") {
                    locationService.occupyDock(task.dockId, task.entryId).then(function (response) {
                        updateTask();
                    }, function (error) {

                        lincUtil.processErrorResponse(error);

                    });
                }

            }

            function releaseDock(task) {
                locationService.releaseDock(originalDock, task.entryId).then(function (response) {
                    reserveOrOccupyDock(task);
                },function(error){
                    lincUtil.processErrorResponse(error);
                });
            }

            $scope.cancel = function () {
                $scope.currentItem = null;
                $state.go('wms.task.receiveTask.list');
            };

            $scope.getDockLists = function () {
                locationService.getLocationList({ type: 'DOCK' }).then(function (response) {
                    $scope.dockList = response;
                },function(error){
                    lincUtil.processErrorResponse(error);
                });
            };

            function init() {
                receiveTaskService.getTaskWithReceipts($stateParams.taskId).then(function (response) {
                    $scope.task = response[0];
                    originalDock = response[0].dockId;
                    $scope.task.receipts = response[1];
                    if (response[0].status == "New" || response[0].status == "In Progress") {

                        $scope.isEnable = false;
                    } else {
                        $scope.isEnable = true;
                    }
                },function(error){
                    lincUtil.processErrorResponse(error);
                });
            }

            init();
        };

        controller.$inject = ['$scope', '$state', '$stateParams',
            'locationService', 'receiveTaskService', 'lincUtil'];

        return controller;
    });
