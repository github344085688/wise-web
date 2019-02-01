'use strict';

define(['angular', 'lodash'
], function(angular, _) {
    var controller = function($scope, $state, $stateParams, pickService, orderPlanService, lincUtil) {
        var checkedTasks;
        $scope.pageSize = 10;
        $scope.search = {};
        $scope.searchTask = function () {
            var searchTaskParam = angular.copy($scope.search);
            searchTask(searchTaskParam);
        };

        function searchTask(param) {
            param.status = "New";
            param.orderPlanIds = [$scope.currentTask.orderPlanId];
            $scope.searchLoading = true;
            pickService.getPickTaskList(param).then(function (response) {
                $scope.searchLoading = false;
                $scope.taskList = response.pickTasks;
                $scope.itemSpecMap = response.itemSpecMap;
                $scope.itemUnitMap = response.itemUnitMap;
                $scope.locationMap = response.locationMap;
                $scope.organizationMap = response.organizationMap;
                $scope.userMap = response.userMap;
                filterOutCurrentTaskFromList($scope.taskList, $scope.currentTask);
                $scope.loadContent(1);
                checkedTasks = [];
            }, function (error) {
                $scope.searchLoading = false;
                lincUtil.processErrorResponse(error);
            });
        }

        function filterOutCurrentTaskFromList(taskList, currentTask) {
            var index = _.findIndex(taskList, function (task) {
                return task.id === currentTask.id;
            });
            if(index > -1) {
                taskList.splice(index, 1);
            }
        }

        $scope.mergeTasks = function () {
            if (checkedTasks.length == 0) {
                lincUtil.messagePopup("Tip", "Please choose some tasks to merge.");
                return;
            }
            var taskIds = _.map(checkedTasks, "id");
            $scope.isSaveloading = true;
            pickService.mergeTask($scope.currentTask.id, {taskIds: taskIds}).then(function (response) {
                $scope.isSaveloading = false;
                lincUtil.messagePopup("Message", "Merge Successful!", function () {
                    $state.go('wms.task.pickTask.view', {
                        taskId: $scope.currentTask.id
                    });
                });
            }, function (error) {
                $scope.isSaveloading = false;
                lincUtil.processErrorResponse(error);
            });
        };

        $scope.loadContent = function (currentPage) {
            $scope.taskViewList = $scope.taskList.slice((currentPage - 1) * $scope.pageSize,
                currentPage * $scope.pageSize > $scope.taskList.length ? $scope.taskList.length : currentPage * $scope.pageSize);
        };

        $scope.isChecked = function(order) {
            return _.find(checkedTasks, function (checkedOrder) {
                return checkedOrder.id == order.id;
            });
        };

        $scope.toggle = function(order) {
            var index = _.findIndex(checkedTasks, function(checkedOrder) {
                return checkedOrder.id === order.id;
            });
            if (index > -1) {
                checkedTasks.splice(index, 1);
            } else {
                checkedTasks.push(order);
            }
        };

        $scope.cancel = function () {
            $state.go("wms.task.pickTask.view", {taskId: $scope.currentTask.id});
        };

        function _init() {
            $scope.isLoading = true;
            pickService.getPickTaskView($stateParams.taskId).then(function(task){
                $scope.isLoading = false;
                $scope.currentTask = angular.copy(task);
                searchTask({});
            }, function (error) {
                $scope.isLoading = false;
                lincUtil.processErrorResponse(error);
            });
        }

        _init();
    };

    controller.$inject = ['$scope', '$state', '$stateParams', 'pickService', 'orderPlanService', 'lincUtil'];
    return controller;
});
